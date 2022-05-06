import { encode } from 'querystring';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { find } from 'lodash';

import { UsersService } from '@seaccentral/core/dist/user/users.service';
import { SocialSignupRequest } from '@seaccentral/core/dist/dto/SocialSignupRequest.dto';
import { ExternalAuthProviderType } from '@seaccentral/core/dist/user/UserAuthProvider.entity';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { Connection, DeepPartial } from 'typeorm';
import { TransactionFor } from '@seaccentral/core/dist/utils/withTransaction';
import { ModuleRef } from '@nestjs/core';
import { OAuthException } from './oauth.exception';
import { AuthService } from '../index/auth.service';

@Injectable()
export class SocialService extends TransactionFor<SocialService> {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly connection: Connection,
    moduleRef: ModuleRef,
  ) {
    super(moduleRef);
  }

  async signupUsingOAuth(
    profile: SocialSignupRequest,
    socialCredential: {
      accessToken: string;
      refreshToken?: string;
      provider: ExternalAuthProviderType;
    },
    extra?: DeepPartial<User>,
  ): Promise<string> {
    const { firstName, lastName, email } = profile;
    const {
      accessToken: socialAccessToken,
      refreshToken: socialRefreshToken,
      provider,
    } = socialCredential;
    const newUser = await this.connection.transaction(async (manager) => {
      const user = await this.usersService.withTransaction(manager).create(
        {
          firstName,
          lastName,
          email,
        },
        extra,
      );
      await this.usersService.withTransaction(manager).createProvider({
        user,
        provider,
        accessToken: socialAccessToken,
        refreshToken: socialRefreshToken,
      });
      this.usersService
        .withTransaction(manager)
        .sendEmailVerificationEmail(user.id);

      return user;
    });
    const token = this.authService.generateToken(newUser, 60, { provider });

    return token;
  }

  async getLoginCredential(
    email: string,
    socialCredential: {
      accessToken: string;
      refreshToken?: string;
      provider: ExternalAuthProviderType;
    },
  ): Promise<string | null> {
    const user = await this.usersService.getByEmail(email);
    if (!user) {
      return null;
    }

    const {
      accessToken: socialAccessToken,
      refreshToken: socialRefreshToken,
      provider,
    } = socialCredential;
    const userProviders = await this.usersService.getProviders(user);
    if (userProviders.length <= 0) {
      throw new InternalServerErrorException(`${user.email} has no provider`);
    }
    const passwordProvider = find(userProviders, { provider: 'password' });
    if (passwordProvider && !user.isEmailConfirmed) {
      // to prevent other people who has the same email in other social providers
      // to be able to access an password account that might be created by another person
      throw new OAuthException(
        `${user.email} is registered using password. Please confirm this email before linking social account`,
      );
    }

    const userProvider = find(userProviders, { provider });
    if (!userProvider) {
      // beause provider-registered email is confirmed which means it is the same person.
      // we can safely link account and grant access
      await this.usersService.createProvider({
        user,
        provider,
        accessToken: socialAccessToken,
        refreshToken: socialRefreshToken,
      });
    }

    const token = this.authService.generateToken(user, 60, { provider });
    return token;
  }

  generateSuccessRedirectUrl(token: string) {
    const response = {
      token,
      flow: 'oauth2',
    };

    return `${this.configService.get('CLIENT_BASE_URL')}/dashboard/?${encode(
      response,
    )}`;
  }
}
