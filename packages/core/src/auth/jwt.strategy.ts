import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';

import { UsersService } from '../user/users.service';
import { ExternalAuthProviderType } from '../user/UserAuthProvider.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (request: any) => {
          if (!request.handshake) return null;
          return request.handshake.auth.token;
        },
        ExtractJwt.fromUrlQueryParameter(
          configService.get('HTTP_AUTH_HEADER') || 'auth_token',
        ),
        ExtractJwt.fromAuthHeaderWithScheme(
          configService.get('HTTP_AUTH_HEADER') || 'auth_token',
        ),
        ExtractJwt.fromHeader(
          configService.get('HTTP_AUTH_HEADER') || 'auth_token',
        ),
      ]),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: {
    userId: string;
    provider: ExternalAuthProviderType;
  }) {
    const user = await this.userService.getById(payload.userId);

    if (payload.provider) {
      return { ...user, provider: payload.provider };
    }
    return user;
  }
}
