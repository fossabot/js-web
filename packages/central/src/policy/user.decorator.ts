import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User as UserEntity } from '@seaccentral/core/dist/user/User.entity';
import { Request } from 'express';

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const { user } = request;

    return user as UserEntity;
  },
);
