import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { JwtStrategy } from '@seaccentral/core/dist/auth/jwt.strategy';
import { UsersModule } from '@seaccentral/core/dist/user/users.module';

import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { CourseModule } from '../course/course.module';
import { OrganizationModule } from '../organization/organization.module';
import { LearningTrackModule } from '../learning-track/learningTrack.module';
import { UserAssignedCourseModule } from '../user-assigned-course/userAssignedCourse.module';
import { UserAssignedLearningTrackModule } from '../user-assigned-learning-track/userAssignedLearningTrack.module';

@Module({
  imports: [
    UsersModule,
    CourseModule,
    UserAssignedCourseModule,
    UserAssignedLearningTrackModule,
    OrganizationModule,
    LearningTrackModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get('JWT_EXPIRATION_TIME_IN_SECONDS')}s`,
        },
      }),
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService, JwtStrategy],
  exports: [UploadService],
})
export class UploadModule {}
