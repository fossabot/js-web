import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import jwt from 'jsonwebtoken';
import { Request } from 'express';
import { isEqual } from 'lodash';

@Injectable()
// https://developer.jwplayer.com/jwplayer/docs/learn-about-webhooks#verify-the-authenticity-of-a-webhook
export class JwWebhookGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const webhookSecret = this.configService.get('JWPLAYER_WEBHOOK_SECRET');
    const req = context.switchToHttp().getRequest<Request>();
    if (!req.headers.authorization) {
      return false;
    }
    const token = req.headers.authorization.replace('Bearer ', '');
    const payload = req.body;
    const jwtPayload = jwt.decode(token, webhookSecret);

    return isEqual(jwtPayload, payload);
  }
}
