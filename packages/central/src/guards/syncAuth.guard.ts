import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class SyncAuthGuard extends AuthGuard('sync') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleRequest(err: any, matchedToken: any, info: any) {
    if (err || !matchedToken || info) {
      throw new HttpException('Token Mismatched', HttpStatus.UNAUTHORIZED);
    }
    return matchedToken;
  }
}
