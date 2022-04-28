import Strategy from 'passport-http-header-strategy';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class SyncAuthStrategy extends PassportStrategy(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Strategy as any,
  'sync',
) {
  constructor(private readonly configService: ConfigService) {
    super({ header: 'X-SYNC-TOKEN', passReqToCallback: true });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async validate(req: Request): Promise<any> {
    return (
      this.configService.get('X_SYNC_TOKEN') === req.headers['x-sync-token']
    );
  }
}
