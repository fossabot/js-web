import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  Req,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { Connection } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ApiBody, ApiTags } from '@nestjs/swagger';

import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import { BaseResponseDto } from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { ContactRetailService } from '@seaccentral/core/dist/crm/contact.retail.service';
import {
  LocalSignupRequestBody,
  LocalSignupResponse,
} from '@seaccentral/core/dist/dto/LocalSignup.dto';
import { TrimPipe } from '@seaccentral/core/dist/utils/TrimPipe';
import { UsersService } from '@seaccentral/core/dist/user/users.service';

import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { ValidateDTO } from './dto/validate.dto';
import JwtRefreshGuard from './jwtRefresh.guard';
import { LocalAuthGuard } from './localAuth.guard';
import { PasswordService } from './password.service';
import { InvitationSignupRequestBody } from './dto/InvitationSignup.dto';
import IRequestWithUserSession from './interface/IRequestWithUserSession.interface';
import IRequestWithUser, {
  IUserWithProvider,
} from './interface/IRequestWithUser.interface';
import { reCaptchaGuard } from './recaptcha.guard';

@Controller('v1')
@ApiTags('Auth Index')
export class IndexController {
  private readonly logger = new Logger(IndexController.name);

  constructor(
    private readonly connection: Connection,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly passwordService: PasswordService,
    private readonly contactRetailService: ContactRetailService,
  ) {}

  @Post('signup/local')
  @UseGuards(reCaptchaGuard('signup_local'))
  @UsePipes(new TrimPipe())
  async signupUsingLocalAuth(
    @Body()
    localSignupBody: LocalSignupRequestBody,
  ) {
    const { firstName, lastName, email, password, leadformurl } =
      localSignupBody;
    const res = await this.connection.transaction(async (manager) => {
      try {
        const user = await this.usersService
          .withTransaction(manager)
          .create(localSignupBody);
        const userAuthProvider = await this.usersService
          .withTransaction(manager)
          .createProviderByPassword(user, password);
        await this.passwordService
          .withTransaction(manager)
          .record(userAuthProvider, password);

        const accessToken = this.authService.getJwtAccessToken(user);
        const refreshToken = this.authService.getJwtRefreshToken(user);
        await this.usersService
          .withTransaction(manager)
          .saveSession(refreshToken, user.id, 'password');

        const response = new BaseResponseDto<Partial<LocalSignupResponse>>();
        response.data = {
          accessToken,
          refreshToken,
          accessTokenExpiry: this.configService.get(
            'JWT_EXPIRATION_TIME_IN_SECONDS',
          ),
          refreshTokenExpiry: this.configService.get(
            'JWT_REFRESH_TOKEN_EXPIRATION_TIME_IN_SECONDS',
          ),
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            profileImageKey: user.profileImageKey,
            isEmailConfirmed: user.isEmailConfirmed,
            isPhoneNumberConfirmed: user.isPhoneNumberConfirmed,
            isActive: user.isActive,
          },
        };
        return response;
        // TODO: Send verification email/code and let user login only when the email is verified.
      } catch (error) {
        throw new HttpException(error.response, error.status);
      }
    });
    this.contactRetailService
      .create({
        firstname: firstName,
        lastname: lastName,
        email,
        phoneno: ' ',
        leadformurl,
        membertype: 'Freemium',
        signupmember: true,
      })
      .catch((error) => this.logger.error(error));

    return res;
  }

  @Post('signup/invitation')
  @UseGuards(reCaptchaGuard('signup_invitation'))
  @UsePipes(new TrimPipe())
  async signupUsingInvitationToken(
    @Body()
    invitationSignupBody: InvitationSignupRequestBody,
  ) {
    return this.connection.transaction(async (manager) => {
      try {
        const { email, firstName, lastName, role, organization, user } =
          await this.usersService.getInvitedUserByToken(
            invitationSignupBody.token,
          );
        if (user) {
          throw new HttpException('User is already exist', HttpStatus.CONFLICT);
        }
        const newUser = await this.usersService
          .withTransaction(manager)
          .create({
            email,
            firstName,
            lastName,
            role,
          });
        const userAuthProvider = await this.usersService
          .withTransaction(manager)
          .createProviderByPassword(newUser, invitationSignupBody.password);
        await this.passwordService
          .withTransaction(manager)
          .record(userAuthProvider, invitationSignupBody.password);

        if (organization) {
          await this.usersService
            .withTransaction(manager)
            .addUserToOrganization(newUser, organization);
        }

        const accessToken = this.authService.getJwtAccessToken(newUser);
        const refreshToken = this.authService.getJwtRefreshToken(newUser);
        await this.usersService
          .withTransaction(manager)
          .saveSession(refreshToken, newUser.id, 'password');
        await this.usersService
          .withTransaction(manager)
          .invalidateInvitationToken(invitationSignupBody.token);
        const response = new BaseResponseDto<Partial<LocalSignupResponse>>();
        response.data = {
          accessToken,
          refreshToken,
          accessTokenExpiry: this.configService.get(
            'JWT_EXPIRATION_TIME_IN_SECONDS',
          ),
          refreshTokenExpiry: this.configService.get(
            'JWT_REFRESH_TOKEN_EXPIRATION_TIME_IN_SECONDS',
          ),
          user: {
            id: newUser.id,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            phoneNumber: newUser.phoneNumber,
            profileImageKey: newUser.profileImageKey,
            isEmailConfirmed: newUser.isEmailConfirmed,
            isPhoneNumberConfirmed: newUser.isPhoneNumberConfirmed,
            isActive: newUser.isActive,
          },
        };

        return response;
      } catch (error) {
        throw new HttpException(error.response, error.status);
      }
    });
  }

  @Post('setup/account')
  @UseGuards(reCaptchaGuard('setup_account'))
  @UsePipes(new TrimPipe())
  async setupAccount(
    @Body()
    invitationSignupBody: InvitationSignupRequestBody,
  ) {
    return this.connection.transaction(async (manager) => {
      try {
        const invitation = await this.usersService.getInvitedUserByToken(
          invitationSignupBody.token,
        );
        if (!invitation.user) {
          throw new HttpException('User does not exist', HttpStatus.NOT_FOUND);
        }
        const userAuthProvider = await this.usersService
          .withTransaction(manager)
          .createProviderByPassword(
            invitation.user,
            invitationSignupBody.password,
          );
        await this.passwordService
          .withTransaction(manager)
          .record(userAuthProvider, invitationSignupBody.password);
        const accessToken = this.authService.getJwtAccessToken(invitation.user);
        const refreshToken = this.authService.getJwtRefreshToken(
          invitation.user,
        );
        await this.usersService
          .withTransaction(manager)
          .saveSession(refreshToken, invitation.user.id, 'password');
        await this.usersService
          .withTransaction(manager)
          .invalidateInvitationToken(invitationSignupBody.token);

        const response = new BaseResponseDto<Partial<LocalSignupResponse>>();
        response.data = {
          accessToken,
          refreshToken,
          accessTokenExpiry: this.configService.get(
            'JWT_EXPIRATION_TIME_IN_SECONDS',
          ),
          refreshTokenExpiry: this.configService.get(
            'JWT_REFRESH_TOKEN_EXPIRATION_TIME_IN_SECONDS',
          ),
          user: {
            id: invitation.user.id,
            email: invitation.user.email,
            firstName: invitation.user.firstName,
            lastName: invitation.user.lastName,
            phoneNumber: invitation.user.phoneNumber,
            profileImageKey: invitation.user.profileImageKey,
            isEmailConfirmed: invitation.user.isEmailConfirmed,
            isPhoneNumberConfirmed: invitation.user.isPhoneNumberConfirmed,
            isActive: invitation.user.isActive,
          },
        };

        return response;
      } catch (error) {
        throw new HttpException(error.response, error.status);
      }
    });
  }

  @HttpCode(200)
  @UseGuards(reCaptchaGuard('login'), LocalAuthGuard)
  @ApiBody({ type: LoginDto })
  @Post('login')
  async logIn(@Req() request: IRequestWithUser) {
    const { user } = request;
    const accessToken = this.authService.getJwtAccessToken(user);
    const refreshToken = this.authService.getJwtRefreshToken(user);

    await this.usersService.saveSession(refreshToken, user.id, 'password');

    await this.authService.pushAnnouncementNotification(user);

    return {
      accessToken,
      refreshToken,
      accessTokenExpiry: this.configService.get(
        'JWT_EXPIRATION_TIME_IN_SECONDS',
      ),
      refreshTokenExpiry: this.configService.get(
        'JWT_REFRESH_TOKEN_EXPIRATION_TIME_IN_SECONDS',
      ),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        profileImageKey: user.profileImageKey,
        isEmailConfirmed: user.isEmailConfirmed,
        isPhoneNumberConfirmed: user.isPhoneNumberConfirmed,
        isActive: user.isActive,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('login/external')
  async externalLogin(@Req() request: IRequestWithUser) {
    const user = request.user as IUserWithProvider;

    const accessToken = this.authService.getJwtAccessToken(user);
    const newRefreshToken = this.authService.getJwtRefreshToken(user);

    await this.authService.pushAnnouncementNotification(user);

    await this.usersService.saveSession(
      newRefreshToken,
      user.id,
      user.provider,
    );

    return {
      accessToken,
      refreshToken: newRefreshToken,
      accessTokenExpiry: this.configService.get(
        'JWT_EXPIRATION_TIME_IN_SECONDS',
      ),
      refreshTokenExpiry: this.configService.get(
        'JWT_REFRESH_TOKEN_EXPIRATION_TIME_IN_SECONDS',
      ),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        profileImageKey: user.profileImageKey,
        isEmailConfirmed: user.isEmailConfirmed,
        isPhoneNumberConfirmed: user.isPhoneNumberConfirmed,
        isActive: user.isActive,
      },
    };
  }

  @Post('validate')
  async validateUsernameOrEmail(@Body() validateDTO: ValidateDTO) {
    try {
      return await this.authService.validateUsernameOrEmail(validateDTO);
    } catch (error) {
      throw new HttpException(error.response, error.status);
    }
  }

  @UseGuards(JwtRefreshGuard)
  @Get('refresh')
  async refresh(@Req() request: IRequestWithUserSession) {
    const { user: userSession } = request;
    const accessToken = this.authService.getJwtAccessToken(userSession.user);

    await this.authService.pushAnnouncementNotification(userSession.user);

    const { user } = userSession;
    return {
      accessToken,
      accessTokenExpiry: this.configService.get(
        'JWT_EXPIRATION_TIME_IN_SECONDS',
      ),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        profileImageKey: user.profileImageKey,
        isEmailConfirmed: user.isEmailConfirmed,
        isPhoneNumberConfirmed: user.isPhoneNumberConfirmed,
        isActive: user.isActive,
      },
    };
  }

  @UseGuards(JwtRefreshGuard)
  @Post('logout')
  @HttpCode(204)
  async logout(@Req() request: IRequestWithUserSession) {
    const { user: userSession } = request;
    await this.usersService.removeRefreshToken(userSession);
  }

  @Get('healthcheck')
  @HttpCode(200)
  healthCheck() {
    return 'healthy';
  }

  @Post('confirm-email')
  async confirmEmail(@Body('key') key: string) {
    const response = new BaseResponseDto<boolean>();
    response.data = await this.usersService.confirmEmail(key);
    return response;
  }
}
