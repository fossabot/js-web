import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';

import { UsersService } from '@seaccentral/core/dist/user/users.service';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderWithScheme(
          configService.get('HTTP_REFRESH_TOKEN_HEADER') || 'refresh_token',
        ),
        ExtractJwt.fromHeader(
          configService.get('HTTP_REFRESH_TOKEN_HEADER') || 'refresh_token',
        ),
      ]),
      secretOrKey: configService.get('JWT_REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(request: Request) {
    const refreshToken =
      (request.headers[
        this.configService.get('HTTP_REFRESH_TOKEN_HEADER')
      ] as string) || '';
    return this.userService.getSession(refreshToken);
  }
}
