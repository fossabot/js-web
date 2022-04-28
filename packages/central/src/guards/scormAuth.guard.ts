import {
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export default class ScormAuthGuard extends AuthGuard('scormJwt') {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  // TODO Prone to backdoor, should have a better way to hndle this
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    if (!request.headers.referer) return false;

    const isNestedIframeRequest = !request.headers.referer.includes(
      this.configService.get('CLIENT_BASE_URL') ?? '',
    );

    return isNestedIframeRequest ? true : super.canActivate(context);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unused-vars
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || info || !user) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return user;
  }
}
