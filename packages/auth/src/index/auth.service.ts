import { Between, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import isAfter from 'date-fns/isAfter';
import { JwtService } from '@nestjs/jwt';
import { ModuleRef } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { compare } from '@seaccentral/core/dist/utils/crypt';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { UsersService } from '@seaccentral/core/dist/user/users.service';
import {
  ExternalAuthProviderType,
  UserAuthProvider,
} from '@seaccentral/core/dist/user/UserAuthProvider.entity';
import { ERROR_CODES } from '@seaccentral/core/dist/error/errors';
import { TransactionFor } from '@seaccentral/core/dist/utils/withTransaction';

import { UserNotification } from '@seaccentral/core/dist/notification/UserNotification.entity';
import { SystemAnnouncement } from '@seaccentral/core/dist/notification/SystemAnnouncement.entity';
import { NotificationProducer } from '@seaccentral/core/dist/queue/notification.producer';
import { PushNotificationSubCategoryKey } from '@seaccentral/core/dist/notification/enum/PushNotificationSubCategory.enum';
import { getDatePeriodString } from '@seaccentral/core/dist/utils/date';
import { NotificationVariableDict as NV } from '@seaccentral/core/dist/notification/NotificationVariableDict';
import { ValidateDTO } from './dto/validate.dto';
import { SSOService } from '../sso/sso.service';

@Injectable()
export class AuthService extends TransactionFor<AuthService> {
  constructor(
    private readonly jwtService: JwtService,
    private readonly ssoService: SSOService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly notificationProducer: NotificationProducer,

    @InjectRepository(UserAuthProvider)
    private userAuthProviderRepository: Repository<UserAuthProvider>,
    @InjectRepository(UserNotification)
    private userNotificationRepository: Repository<UserNotification>,
    @InjectRepository(SystemAnnouncement)
    private readonly systemAnnouncement: Repository<SystemAnnouncement>,
    moduleRef: ModuleRef,
  ) {
    super(moduleRef);
  }

  public async getAuthenticatedUser(email: string, plainTextPassword: string) {
    try {
      const user = await this.usersService.getByEmail(email);
      if (!user) {
        throw new HttpException(
          'Wrong credentials provided',
          HttpStatus.BAD_REQUEST,
        );
      }
      const authProvider =
        await this.usersService.getPasswordAuthProviderByUserId(user.id);

      const date = Date.now();

      if (user.isLockedOut && isAfter(user.lockoutEndDateUTC || date, date)) {
        throw new HttpException(
          'User has been locked out due to too many login attempts',
          HttpStatus.FORBIDDEN,
        );
      }

      if (!authProvider.hashedPassword) {
        throw new HttpException(
          'Password not linked with user',
          HttpStatus.BAD_REQUEST,
        );
      }
      const isPasswordMatching = await this.verifyPassword(
        plainTextPassword,
        authProvider.hashedPassword,
      );

      if (!isPasswordMatching) {
        await this.usersService.updateUserLoginAttempt(user.id);
        throw new HttpException(
          'Wrong credentials provided',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!user.isActivated) {
        throw new HttpException(
          ERROR_CODES.ERROR_USER_DEACTIVATED,
          HttpStatus.FORBIDDEN,
        );
      }

      await this.usersService.resetLoginAttempts(user.id);

      return user;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      // if the error was thrown from a core service, it is serialized as a normal object
      if (error.status && error.response) {
        throw new HttpException(error.response, error.status);
      }
      throw error;
    }
  }

  private async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ) {
    const isPasswordMatching = await compare(plainTextPassword, hashedPassword);
    return isPasswordMatching;
  }

  public getJwtAccessToken(user: User) {
    const payload = { userId: user.id, generatedAt: new Date() };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this.configService.get('JWT_EXPIRATION_TIME_IN_SECONDS')}s`,
    });

    return accessToken;
  }

  public generateToken(user: User, timeInSeconds = 10, extras = {}) {
    const payload = { userId: user.id, generatedAt: new Date(), ...extras };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${timeInSeconds}s`,
    });

    return token;
  }

  public getJwtRefreshToken(user: User) {
    const payload = { userId: user.id, generatedAt: new Date() };
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.get(
        'JWT_REFRESH_TOKEN_EXPIRATION_TIME_IN_SECONDS',
      )}s`,
    });

    return refreshToken;
  }

  public async validateUsernameOrEmail(validateDTO: ValidateDTO) {
    const { usernameOrEmail } = validateDTO;
    const user = await this.usersService.getByUsernameOrEmail(usernameOrEmail);

    const userAuthProviders = await this.userAuthProviderRepository.find({
      where: { userId: user.id },
      relations: ['user'],
    });

    if (!userAuthProviders || userAuthProviders.length < 1) {
      throw new HttpException(
        ERROR_CODES.AUTH_PROVIDER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    if (userAuthProviders.some((auth) => !auth.user.isActivated)) {
      throw new HttpException(
        ERROR_CODES.ERROR_USER_DEACTIVATED,
        HttpStatus.FORBIDDEN,
      );
    }

    const promises = userAuthProviders.map(async (uap) => {
      if (
        uap.provider === ExternalAuthProviderType.SAMLSSO &&
        uap.organization
      ) {
        const { sp, idp } = await this.ssoService.getSPIDP(
          uap.organization.slug,
        );

        const { context } = sp.createLoginRequest(idp, 'redirect');

        return {
          provider: uap.provider,
          buttonLabel: uap.organization.name,
          ssoLoginUrl: context,
        };
      }

      return {
        provider: uap.provider,
        buttonLabel: null,
        ssoLoginUrl: null,
      };
    });

    return Promise.all(promises);
  }

  public async pushAnnouncementNotification(user: User) {
    const now = new Date().toISOString();
    const systemAnnouncement = await this.systemAnnouncement.findOne({
      where: {
        startDate: LessThanOrEqual(now),
        endDate: MoreThanOrEqual(now),
        isActive: true,
      },
    });
    if (systemAnnouncement) {
      const userNotification = await this.userNotificationRepository.findOne({
        relations: ['notification'],
        where: {
          user,
          notification: {
            category: {
              key: PushNotificationSubCategoryKey.SYSTEM_ANNOUNCEMENT,
            },
          },
          notifyDate: Between(
            systemAnnouncement.startDate,
            systemAnnouncement.endDate,
          ),
        },
      });
      if (!userNotification) {
        const { startDateString, endDateString } = getDatePeriodString(
          systemAnnouncement.messageStartDateTime,
          systemAnnouncement.messageEndDateTime,
        );
        this.notificationProducer
          .notify(PushNotificationSubCategoryKey.SYSTEM_ANNOUNCEMENT, user.id, {
            [NV.SYSTEM_ANNOUNCEMENT_TITLE.alias]: systemAnnouncement.title,
            [NV.SYSTEM_ANNOUNCEMENT_MESSAGE_START_DATETIME.alias]:
              startDateString,
            [NV.SYSTEM_ANNOUNCEMENT_MESSAGE_END_DATETIME.alias]: endDateString,
            [NV.SYSTEM_ANNOUNCEMENT_MESSAGE.alias]: systemAnnouncement.message,
          })
          .catch();
      }
     }   
  }
}
