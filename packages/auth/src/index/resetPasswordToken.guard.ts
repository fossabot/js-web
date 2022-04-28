import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { UsersService } from '@seaccentral/core/dist/user/users.service';
import { Request } from 'express';
import { differenceInSeconds } from 'date-fns';
import { ResetPasswordDto } from './dto/resetPassword.dto';

@Injectable()
export default class ResetPasswordTokenGuard implements CanActivate {
  constructor(private readonly userService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as Request;
    const { token } = request.body as ResetPasswordDto;
    const TOKEN_EXPIRE_HOURS = 2;

    if (!token) {
      return false;
    }
    const user = await this.userService.getUserByPasswordResetKey(token);
    if (!user) {
      return false;
    }

    const { passwordResetRequestDateUTC } = user;
    const isTokenExpired =
      differenceInSeconds(
        passwordResetRequestDateUTC as Date,
        new Date(new Date().toUTCString()),
      ) <=
      -TOKEN_EXPIRE_HOURS * 60 * 60;
    return !isTokenExpired;
  }
}
