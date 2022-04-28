import { EntityManager } from 'typeorm';
import { ExecutionContext, Injectable, CanActivate } from '@nestjs/common';

import { User } from '@seaccentral/core/dist/user/User.entity';
import { ModuleRefProxy } from '@seaccentral/core/dist/access-control/moduleRefProxy';
import { UserEnrolledCourse } from '@seaccentral/core/dist/course/UserEnrolledCourse.entity';

import IRequestWithUser from '../invitation/interface/IRequestWithUser';

@Injectable()
export default class CourseMaterialDownload implements CanActivate {
  constructor(
    private readonly policies: string[],
    private readonly moduleRef: ModuleRefProxy,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<IRequestWithUser>();
    if (!request.user) {
      return false;
    }
    const userEnrolledCourseRepository = this.moduleRef
      .get(EntityManager)
      .getRepository(UserEnrolledCourse);
    const user = request.user as User;
    const { courseId } = request.params;

    const userEnrolledCourse = await userEnrolledCourseRepository.findOne({
      course: { id: courseId },
      user: { id: user.id },
    });

    return !!userEnrolledCourse;
  }
}
