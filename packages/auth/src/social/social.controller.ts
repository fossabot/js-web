/* eslint @typescript-eslint/no-empty-function: "off" -- Oauth empty method to expose api */
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { Profile as LinkedinProfile } from 'passport-linkedin-oauth2';
import {
  Controller,
  Get,
  UseGuards,
  UseFilters,
  Res,
  Logger,
} from '@nestjs/common';

import { ExternalAuthProviderType } from '@seaccentral/core/dist/user/UserAuthProvider.entity';

import { ContactRetailService } from '@seaccentral/core/dist/crm/contact.retail.service';
import { Connection } from 'typeorm';
import { GoogleGuard } from './google.guard';
import { OAuthFilter } from './oauth.filter';
import { SocialUser } from './social.decorator';
import { FacebookGuard } from './facebook.guard';
import { SocialService } from './social.service';
import { GoogleProfile } from './google.strategy';
import { LinkedinAuthGuard } from './linkedin.guard';
import { SocialUserDto } from './dto/SocialUser.dto';
import { FacebookProfile } from './facebook.strategy';

@Controller('social')
@ApiTags('Social')
export class SocialController {
  private readonly logger = new Logger(SocialController.name);

  constructor(
    private readonly socialService: SocialService,
    private readonly connection: Connection,
    private readonly contactRetailService: ContactRetailService,
  ) {}

  @Get('linkedin')
  @UseGuards(LinkedinAuthGuard)
  oauthLinkedin() {}

  @Get('linkedin/redirect')
  @UseGuards(LinkedinAuthGuard)
  @UseFilters(OAuthFilter)
  async oauthLinkedinCallback(
    @SocialUser() socialUser: SocialUserDto<LinkedinProfile>,
    @Res() res: Response,
  ) {
    const { name, emails } = socialUser.profile;
    const mainEmail = emails[0].value;
    const socialCredential = {
      accessToken: socialUser.accessToken,
      refreshToken: socialUser.refreshToken,
      provider: ExternalAuthProviderType.LinkedIn,
    };
    let token = await this.socialService.getLoginCredential(
      mainEmail,
      socialCredential,
    );
    if (!token) {
      token = await this.connection.transaction(async (manager) => {
        return this.socialService.withTransaction(manager).signupUsingOAuth(
          {
            firstName: name.givenName,
            lastName: name.familyName,
            email: mainEmail,
          },
          socialCredential,
        );
      });
      this.contactRetailService
        .create({
          firstname: name.givenName,
          lastname: name.familyName,
          email: mainEmail,
          phoneno: ' ',
          leadformurl: '/social/linkedin',
          membertype: 'Freemium',
          signupmember: true,
        })
        .catch((error) => this.logger.error(error));
    }

    return res.redirect(this.socialService.generateSuccessRedirectUrl(token));
  }

  @Get('google')
  @UseGuards(GoogleGuard)
  oauthGoogle() {}

  @Get('google/redirect')
  @UseGuards(GoogleGuard)
  @UseFilters(OAuthFilter)
  async oauthGoogleCallback(
    @SocialUser() socialUser: SocialUserDto<GoogleProfile>,
    @Res() res: Response,
  ) {
    const { name, emails } = socialUser.profile;
    const [{ value: mainEmail }] = emails;
    const socialCredential = {
      accessToken: socialUser.accessToken,
      refreshToken: socialUser.refreshToken,
      provider: ExternalAuthProviderType.Google,
    };
    let token = await this.socialService.getLoginCredential(
      mainEmail,
      socialCredential,
    );
    if (!token) {
      token = await this.connection.transaction(async (manager) => {
        return this.socialService.withTransaction(manager).signupUsingOAuth(
          {
            firstName: name?.givenName,
            lastName: name?.familyName,
            email: mainEmail,
          },
          socialCredential,
        );
      });
      this.contactRetailService
        .create({
          firstname: name?.givenName || '',
          lastname: name?.familyName || '',
          email: mainEmail,
          phoneno: ' ',
          leadformurl: '/social/google',
          membertype: 'Freemium',
          signupmember: true,
        })
        .catch((error) => this.logger.error(error));
    }

    return res.redirect(this.socialService.generateSuccessRedirectUrl(token));
  }

  @Get('facebook')
  @UseGuards(FacebookGuard)
  oauthFacebook() {}

  @Get('facebook/redirect')
  @UseGuards(FacebookGuard)
  @UseFilters(OAuthFilter)
  async oauthFacebookCallback(
    @SocialUser() socialUser: SocialUserDto<FacebookProfile>,
    @Res() res: Response,
  ) {
    const { name, emails } = socialUser.profile;
    const [{ value: mainEmail }] = emails;
    const socialCredential = {
      accessToken: socialUser.accessToken,
      refreshToken: socialUser.refreshToken,
      provider: ExternalAuthProviderType.Facebook,
    };
    let token = await this.socialService.getLoginCredential(
      mainEmail,
      socialCredential,
    );
    if (!token) {
      token = await this.connection.transaction(async (manager) => {
        return this.socialService.withTransaction(manager).signupUsingOAuth(
          {
            firstName: name?.givenName,
            lastName: name?.familyName,
            email: mainEmail,
          },
          socialCredential,
        );
      });
      this.contactRetailService
        .create({
          firstname: name?.givenName || '',
          lastname: name?.familyName || '',
          email: mainEmail,
          phoneno: ' ',
          leadformurl: '/social/facebook',
          membertype: 'Freemium',
          signupmember: true,
        })
        .catch((error) => this.logger.error(error));
    }

    return res.redirect(this.socialService.generateSuccessRedirectUrl(token));
  }
}
