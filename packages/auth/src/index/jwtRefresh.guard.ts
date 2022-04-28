import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export default class JwtRefreshGuard extends AuthGuard('jwt-refresh-token') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleRequest(err: any, user: any, info: any) {
    if (err || info || !user) {
      throw new HttpException('Session expired', HttpStatus.UNAUTHORIZED);
    }

    return user;
  }
}
