import { encode } from 'querystring';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import {
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import {
  extendIDPMetadata,
  getLocalIdentityProvider,
  getLocalServiceProvider,
  tagReplacement,
} from '@seaccentral/core/dist/sso/saml';
import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';

import { SSOService } from './sso.service';
import { SamlLoginException, SamlSsoException } from './sso.exception';
import { AuthFailRedirectFilter } from '../filter/authFailRedirect.filter';
import IRequestWithUser from '../index/interface/IRequestWithUser.interface';

@Controller('v1/sso')
@ApiTags('SSO')
export class SSOController {
  private readonly logger = new Logger(SSOController.name);

  constructor(
    private readonly ssoService: SSOService,
    private readonly configService: ConfigService,
  ) {}

  @Get('saml/:slug/idp/metadata')
  async getIDPMetadata(@Param('slug') slug: string, @Res() res: Response) {
    const idp = await getLocalIdentityProvider(
      slug,
      this.configService.get('SEAC_SAML_IDP_PRIVATE_KEY_KEY') || '',
      this.configService.get('SEAC_SAML_IDP_SIGNING_CERT_KEY') || '',
    );

    const idpMetadata = await extendIDPMetadata(idp.getMetadata());

    res.set('Content-Type', 'text/xml');
    res.send(idpMetadata);
  }

  // NOTE: Using loggers here to debug for integration. Will remove once done.
  @Get('saml/:token/login')
  @UseGuards(JwtAuthGuard)
  @UseFilters(AuthFailRedirectFilter)
  async validateAndLogin(
    @Res() res: Response,
    @Req() req: IRequestWithUser,
    @Param('token') token: string,
  ) {
    if (!req.user) {
      return res.redirect(
        `${this.configService.get('CLIENT_BASE_URL')}/login/samlp/?${encode({
          TARGET: req.originalUrl.replace('/api/auth', ''),
        })}`,
      );
    }

    try {
      this.logger.log('SAML Login Initiated', req.query.SAMLRequest as string);

      const { idp, sp, organization } = await this.ssoService.getIDPSP(token);
      const parsedResult = await idp.parseLoginRequest(sp, 'redirect', req);

      this.logger.log('SAML Parsed Result', JSON.stringify(parsedResult));

      await this.ssoService.hasAccessToLinkedCourses(req.user, organization);

      const response = await idp.createLoginResponse(
        sp,
        parsedResult,
        'post',
        req.user,
        (template) => tagReplacement(template, sp, idp, req.user),
      );

      this.logger.log('SAML Response', JSON.stringify(response));

      return res.render('saml-sso-success.hbs', response);
    } catch (err) {
      this.logger.error('Error with SSO Login', err);
      throw new SamlLoginException(err.message);
    }
  }

  @Get('saml/external-login-url/:planId')
  @UseGuards(JwtAuthGuard)
  @UseFilters(AuthFailRedirectFilter)
  async getThirdPartyLoginUrl(@Param('planId') planId: string) {
    const organization = await this.ssoService.getPlanProvider(planId);
    const { idp, sp } = await this.ssoService.getIDPSP(organization.slug);
    const { context } = sp.createLoginRequest(idp, 'redirect');

    return context;
  }

  @Get('saml/:slug/sp/metadata')
  async getSPMetadata(@Param('slug') slug: string, @Res() res: Response) {
    const sp = getLocalServiceProvider(slug);

    res.set('Content-Type', 'text/xml');
    res.send(sp.getMetadata());
  }

  @Post('saml/:slug/callback')
  async samlSSOCallback(
    @Param('slug') slug: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const { sp, idp, organization } = await this.ssoService.getSPIDP(slug);
      const parsedResult = await sp.parseLoginResponse(idp, 'post', req);
      const email = await this.ssoService.extractEmailFromSAMLSSOResponse(
        parsedResult,
      );
      const { token } = await this.ssoService.getLoginCredentialForSAMLSSO(
        email,
        organization,
      );

      return res.redirect(
        this.ssoService.generateSAMLSSOSuccessRedirectUrl(token),
      );
    } catch (error) {
      throw new SamlSsoException(error.message);
    }
  }
}
