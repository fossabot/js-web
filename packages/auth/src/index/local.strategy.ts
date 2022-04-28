import { Strategy } from 'passport-local';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { User } from '@seaccentral/core/dist/user/User.entity';
import { ERROR_CODES } from '@seaccentral/core/dist/error/errors';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<User> {
    const user = await this.authService.getAuthenticatedUser(email, password);

    if (!user.isActivated) {
      throw new HttpException(
        ERROR_CODES.ERROR_USER_DEACTIVATED,
        HttpStatus.FORBIDDEN,
      );
    }

    return user;
  }
}
