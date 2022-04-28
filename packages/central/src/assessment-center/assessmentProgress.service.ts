import { Injectable } from '@nestjs/common';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { UserCourseOutlineProgressStatus } from '@seaccentral/core/dist/course/UserCourseOutlineProgressStatus.enum';
import { Repository } from 'typeorm';
import { UserCourseOutlineProgress } from '@seaccentral/core/dist/course/UserCourseOutlineProgress.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ExternalAssessment } from '@seaccentral/core/dist/assessment/ExternalAssessment.entity';
import { TransactionFor } from '@seaccentral/core/dist/utils/withTransaction';
import { ModuleRef } from '@nestjs/core';
import { UserCourseProgressService } from '../course/userCourseProgress.service';
import { AssessmentStatus } from './interface/IassessmentCenter';

@Injectable()
export class AssessmentProgressService extends TransactionFor<AssessmentProgressService> {
  constructor(
    moduleRef: ModuleRef,
    @InjectRepository(UserCourseOutlineProgress)
    private readonly userCourseOutlineProgressRepository: Repository<UserCourseOutlineProgress>,
    @InjectRepository(ExternalAssessment)
    private readonly externalAssessmentRepository: Repository<ExternalAssessment>,
    private readonly userCourseProgressService: UserCourseProgressService,
  ) {
    super(moduleRef);
  }

  async begin(courseOutlineId: string, user: User) {
    await this.externalAssessmentRepository.update(
      { courseOutlineId, user },
      { status: AssessmentStatus.InProgress },
    );
    const result = await this.userCourseOutlineProgressRepository
      .createQueryBuilder()
      .insert()
      .values({
        courseOutlineId,
        user,
        percentage: 50,
        status: UserCourseOutlineProgressStatus.IN_PROGRESS,
      })
      .orIgnore()
      .execute();
    await this.userCourseProgressService.recalculateByCourseOutline(
      user,
      courseOutlineId,
    );

    return result;
  }

  async complete(courseOutlineId: string, user: User) {
    await this.externalAssessmentRepository.update(
      { courseOutlineId, user },
      { status: AssessmentStatus.Completed },
    );
    const result = await this.userCourseOutlineProgressRepository.update(
      { courseOutlineId, user },
      { status: UserCourseOutlineProgressStatus.COMPLETED, percentage: 100 },
    );
    await this.userCourseProgressService.recalculateByCourseOutline(
      user,
      courseOutlineId,
    );

    return result;
  }
}
