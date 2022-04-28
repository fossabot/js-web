import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class ScormAuthStrategy extends PassportStrategy(Strategy, 'scormJwt') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          let token = null;
          if (req && req.cookies) token = req.cookies.scorm_token;
          return token;
        },
        ExtractJwt.fromUrlQueryParameter('scorm_token'),
        ExtractJwt.fromAuthHeaderWithScheme('scorm_token'),
        ExtractJwt.fromHeader('scorm_token'),
      ]),
      secretOrKey: configService.get('SCORM_JWT_SECRET'),
    });
  }

  async validate(payload: { userId?: string }) {
    if (payload?.userId) return payload;
    return null;
  }
}
