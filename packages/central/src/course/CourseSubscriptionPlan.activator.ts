import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { CourseAccessCheckerService } from '@seaccentral/core/dist/course/courseAccessCheckerService.service';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { EntityManager } from 'typeorm';
import IRequestWithUser from '../invitation/interface/IRequestWithUser';

@Injectable()
export class CourseSubscriptionPlanActivator implements CanActivate {
  constructor(
    private readonly courseAccessCheckerService: CourseAccessCheckerService,
    private readonly moduleRef: ModuleRef,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<IRequestWithUser>();

    const user = request.user as User;

    if (!user) {
      return false;
    }

    const entityManager = this.moduleRef.get(EntityManager, { strict: false });

    const courseOutlineId = request.params.outlineId as string;
    const courseId = request.params.courseId as string;

    return this.courseAccessCheckerService.hasAccess(
      user,
      { courseId, courseOutlineId },
      entityManager,
    );
  }
}
