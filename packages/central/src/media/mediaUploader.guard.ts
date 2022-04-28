/**
 * Verify media ownership
 */

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { UserPolicies } from '@seaccentral/core/dist/access-control/policy.guard';
import { Request } from 'express';
import { GOD_MODE } from '@seaccentral/core/dist/access-control/constants';
import { MediaService } from './media.service';

@Injectable()
export class MediaUploaderGuard implements CanActivate {
  constructor(private readonly mediaService: MediaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & UserPolicies>();
    if (!request.user) {
      return false;
    }
    if (request.userPolicies.has(GOD_MODE.GRANT_ALL_ACCESS)) {
      return true;
    }

    try {
      await this.mediaService.getOneMedia({
        id: request.params.id,
        uploader: request.user as User,
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}
