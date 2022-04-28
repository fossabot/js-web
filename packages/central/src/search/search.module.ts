import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UsersModule } from '@seaccentral/core/dist/user/users.module';
import { CourseEntityModule } from '@seaccentral/core/dist/course/courseEntity.module';
import { SearchModule as CoreSearchModule } from '@seaccentral/core/dist/search/search.module';
import { CourseAccessCheckerModule } from '@seaccentral/core/dist/course/courseAccessChecker.module';
import { LearningTrackEntityModule } from '@seaccentral/core/dist/learning-track/learningTrackEntity.module';

import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { InstructorService } from '../instructor/instructor.service';

@Module({
  imports: [
    UsersModule,
    CoreSearchModule,
    CourseEntityModule,
    LearningTrackEntityModule,
    CourseAccessCheckerModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get('JWT_EXPIRATION_TIME_IN_SECONDS')}s`,
        },
      }),
    }),
  ],
  controllers: [SearchController],
  providers: [SearchService, InstructorService],
  exports: [SearchService],
})
export class SearchModule {}
