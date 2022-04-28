import { ConfigService } from '@nestjs/config';
import { ILike, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

import { User } from '@seaccentral/core/dist/user/User.entity';
import { LoginSetting } from '@seaccentral/core/dist/admin/Login.setting.entity';
import { Invitation } from '@seaccentral/core/dist/invitation/Invitation.entity';
import { UserIdentifiers } from '@seaccentral/core/dist/dto/UserIdentifiers.dto';
import { PasswordSetting } from '@seaccentral/core/dist/admin/Password.setting.entity';
import { SYSTEM_ROLES } from '@seaccentral/core/dist/utils/constants';

import { LoginSettingDto } from './dto/LoginSetting.dto';
import { PasswordSettingDto } from './dto/PasswordSetting.dto';
import { UserQueryDto } from './dto/UserQuery.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(LoginSetting)
    private loginSettingRepository: Repository<LoginSetting>,
    @InjectRepository(PasswordSetting)
    private passwordSettingRepository: Repository<PasswordSetting>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Invitation)
    private invitationRepository: Repository<Invitation>,
  ) {}

  async updateLoginSetting(
    loginSetting: LoginSettingDto,
  ): Promise<LoginSettingDto> {
    try {
      const result = await this.loginSettingRepository.update(
        loginSetting.id as string,
        loginSetting,
      );

      if (result.affected && result.affected > 0) {
        return loginSetting;
      }

      throw new Error(
        `Can't update this login setting, Requested data = '${JSON.stringify(
          loginSetting,
        )}'`,
      );
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updatePasswordSetting(
    passwordSetting: PasswordSettingDto,
  ): Promise<PasswordSettingDto> {
    try {
      const result = await this.passwordSettingRepository.update(
        passwordSetting.id as string,
        passwordSetting,
      );

      if (result.affected && result.affected > 0) {
        return passwordSetting;
      }

      throw new Error(
        `Can't update this password setting, Requested data = '${JSON.stringify(
          passwordSetting,
        )}'`,
      );
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findLoginSetting(): Promise<LoginSettingDto> {
    const loginSetting = await this.loginSettingRepository.findOne();

    if (loginSetting) {
      return loginSetting as LoginSettingDto;
    }

    throw new HttpException(
      'Login setting has no value.',
      HttpStatus.NOT_FOUND,
    );
  }

  async findPasswordSetting(): Promise<PasswordSettingDto> {
    const passwordSetting = await this.passwordSettingRepository.findOne();

    if (passwordSetting) {
      return passwordSetting as PasswordSettingDto;
    }

    throw new HttpException(
      'Password setting has no value.',
      HttpStatus.NOT_FOUND,
    );
  }

  async unlockUsers(userIdsBody: UserIdentifiers) {
    try {
      const lockedUsers = await this.usersRepository.find({
        where: {
          id: In(userIdsBody.ids),
          isActive: true,
          isLockedOut: true,
        },
      });

      if (!lockedUsers || lockedUsers.length === 0) {
        throw new HttpException(
          {
            error: "Locked Users don't exist.",
          },
          HttpStatus.NOT_FOUND,
        );
      }

      lockedUsers.forEach((user) => {
        user.isLockedOut = false;
        user.lockoutEndDateUTC = null;
        user.accessFailedCount = 0;
      });

      await this.usersRepository.save(lockedUsers);

      // TODO: Not in this MVP (Prone to abuse)
      // const promises = lockedUsers.map(async (user) => {
      //   if (user.email) return email.sendEmail(this.buildUserUnlockEmail(user));
      //   return Promise.resolve();
      // });
      //
      // await Promise.all(promises);
    } catch (error) {
      throw error;
    }
  }

  async findInvitedUsers(
    hideInactive: boolean,
    query: { skip: number; take: number },
  ) {
    const count = await this.invitationRepository.count({
      ...(hideInactive && { where: { isActive: true } }),
    });

    const invitations = await this.invitationRepository.find({
      skip: query.skip,
      take: query.take,
      order: {
        createdAt: 'ASC',
      },
      ...(hideInactive && { where: { isActive: true } }),
    });

    return { invitations, count };
  }

  async findUsers(query: UserQueryDto) {
    const searchField = query.searchField
      ? { [query.searchField]: ILike(`%${query.search}%`) }
      : {};

    const builder = this.usersRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.userRoles', 'userRoles')
      .innerJoinAndSelect('userRoles.role', 'role')
      .where({
        ...searchField,
        isActive: true,
      });

    if (query.role) {
      builder.andWhere('role.name = :name', { name: SYSTEM_ROLES[query.role] });
    }
    if (query.orderBy) {
      builder.orderBy(`user.${query.orderBy}`, query.order as any);
    }

    const userCount = await builder.getCount();
    const users = await builder.skip(query.skip).take(query.take).getMany();

    if (query.id && !users.some((user) => user.id === query.id)) {
      const specificUser = await builder
        .andWhere('user.id = :id', { id: query.id })
        .getOne();
      if (specificUser) {
        users.unshift(specificUser);
      }
    }

    return { users, userCount };
  }

  async findUsersByEmails(emails: string[]) {
    return this.usersRepository.find({
      where: {
        email: In(emails),
        isActive: true,
      },
    });
  }

  async createLoginSetting() {
    const setting = await this.loginSettingRepository.findOne();
    if (setting) {
      return;
    }

    const newSetting = new LoginSetting();
    newSetting.maxAttempts = 3;
    newSetting.lockDuration = 30 * 60;
    await this.loginSettingRepository.save(newSetting);
  }

  // TODO: Use proper template.
  buildUserUnlockEmail(user: User) {
    return {
      subject: 'Your account has been unlocked',
      to: user.email as string,
      from: this.configService.get('AWS_SES_SENDER_ADDRESS'),
      html: `<strong>Please click the link to visit the login page: </strong><a href="${this.configService.get(
        'CLIENT_BASE_URL',
      )}/login">Login to SEAC</a>`,
    };
  }

  async createPasswordSetting() {
    const setting = await this.passwordSettingRepository.findOne();
    if (setting) {
      return;
    }

    const newSetting = this.passwordSettingRepository.create();
    newSetting.expireIn = 30;
    newSetting.notifyIn = 7;
    await this.passwordSettingRepository.save(newSetting);
  }
}
