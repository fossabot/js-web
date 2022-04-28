import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ERROR_CODES } from '../error/errors';
import IRequestWithUser from './IRequestWithUser';
import { User } from './User.entity';
import { UsersService } from './users.service';

@Injectable()
export class PlanUpgradeActivator implements CanActivate {
  constructor(private readonly userService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<IRequestWithUser>();

    const user = request.user as User;

    if (!user) {
      return false;
    }

    const canUpgradePlan = await this.userService.checkCanUpgradePlan(user);

    if (!canUpgradePlan) {
      throw new ForbiddenException(ERROR_CODES.CANNOT_UPGRADE_PLAN);
    }

    return true;
  }
}
