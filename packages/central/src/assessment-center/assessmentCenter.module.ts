import { Module } from '@nestjs/common';
import { AssessmentEntityModule } from '@seaccentral/core/dist/assessment/assessmentEntity.module';
import { CourseEntityModule } from '@seaccentral/core/dist/course/courseEntity.module';
import { CourseModule } from '../course/course.module';
import { AssessmentCenterController } from './assessmentCenter.controller';
import { AssessmentCenterService } from './assessmentCenter.service';
import { AssessmentProgressService } from './assessmentProgress.service';

@Module({
  imports: [AssessmentEntityModule, CourseEntityModule, CourseModule],
  controllers: [AssessmentCenterController],
  providers: [AssessmentCenterService, AssessmentProgressService],
})
export class AssessmentCenterModule {}
