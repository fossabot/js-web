import {
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ERROR_CODES } from '../error/errors';

@Injectable()
export default class JwtAuthGuard extends AuthGuard('jwt') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || info || !user) {
      const request = context.switchToHttp().getRequest();
      const isSAMLRequestUrl =
        request?.route?.path === '/api/auth/v1/sso/saml/:token/login';

      if (isSAMLRequestUrl) {
        return null;
      }

      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    if (!user.isActivated) {
      throw new HttpException(
        ERROR_CODES.ERROR_USER_DEACTIVATED,
        HttpStatus.FORBIDDEN,
      );
    }

    return user;
  }
}
