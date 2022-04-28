import Strategy from 'passport-http-header-strategy';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class CRMAuthStrategy extends PassportStrategy(Strategy as any, 'crm') {
  constructor(private readonly configService: ConfigService) {
    super({ header: 'X-CRM-TOKEN', passReqToCallback: true });
  }

  async validate(req: Request): Promise<any> {
    return this.configService.get('X_CRM_TOKEN') === req.headers['x-crm-token'];
  }
}
