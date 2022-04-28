import { Module } from '@nestjs/common';
import { RawProductEntityModule } from '@seaccentral/core/dist/raw-product/rawProductEntity.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEnrolledCourse } from '@seaccentral/core/dist/course/UserEnrolledCourse.entity';
import { UserEnrolledLearningTrack } from '@seaccentral/core/dist/learning-track/UserEnrolledLearningTrack.entity';
import UserActivityService from './userActivity.service';
import UserActivityController from './userActivity.controller';

@Module({
  imports: [
    RawProductEntityModule,
    TypeOrmModule.forFeature([UserEnrolledCourse, UserEnrolledLearningTrack]),
  ],
  controllers: [UserActivityController],
  providers: [UserActivityService],
})
export class UserActivityModule {}
