import { HttpException, HttpStatus } from '@nestjs/common';
import LMSException from '@seaccentral/core/dist/error/lmsException';

export class OAuthException extends LMSException {
  code = 'ERROR_OAUTH';

  constructor(
    objectOrError: string | Record<string, unknown>,
    description = 'OAuth error',
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
