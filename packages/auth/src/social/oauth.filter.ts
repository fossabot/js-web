import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  Injectable,
} from '@nestjs/common';
import { AuthorizationError } from 'passport-oauth2';
import { AuthFailRedirectFilter } from '../filter/authFailRedirect.filter';
import { OAuthException } from './oauth.exception';

@Injectable()
@Catch(AuthorizationError, BadRequestException, OAuthException)
export class OAuthFilter implements ExceptionFilter {
  constructor(
    private readonly authFailRedirectFilter: AuthFailRedirectFilter,
  ) {}

  catch(error: Error, host: ArgumentsHost) {
    return this.authFailRedirectFilter.catch(
      new OAuthException(error.message),
      host,
    );
  }
}
