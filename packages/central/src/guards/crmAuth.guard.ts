import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class CRMAuthGuard extends AuthGuard('crm') {
  handleRequest(err: any, matchedToken: any, info: any) {
    if (err || !matchedToken || info) {
      throw new HttpException('Token Mismatched', HttpStatus.UNAUTHORIZED);
    }
    return matchedToken;
  }
}
