/* eslint-disable max-classes-per-file */

import { HttpException, HttpStatus } from '@nestjs/common';
import LMSException from '@seaccentral/core/dist/error/lmsException';

export class SamlLoginException extends LMSException {
  code = 'ERROR_SAML_LOGIN';

  constructor(
    objectOrError: string | Record<string, unknown>,
    description = 'SAML login error',
  ) {
    super(
      HttpException.createBody(
        objectOrError,
        description,
        HttpStatus.UNAUTHORIZED,
      ),
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class SamlSsoException extends LMSException {
  code = 'ERROR_SAML_SSO';

  constructor(
    objectOrError: string | Record<string, unknown>,
    description = 'SAML SSO error',
  ) {
    super(
      HttpException.createBody(
        objectOrError,
        description,
        HttpStatus.UNAUTHORIZED,
      ),
      HttpStatus.UNAUTHORIZED,
    );
  }
}
