import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { JwtStrategy } from '@seaccentral/core/dist/auth/jwt.strategy';
import { UsersModule } from '@seaccentral/core/dist/user/users.module';
import { CourseEntityModule } from '@seaccentral/core/dist/course/courseEntity.module';
import { CourseAccessCheckerModule } from '@seaccentral/core/dist/course/courseAccessChecker.module';

import { ScormService } from './scorm.service';
import { ScormController } from './scorm.controller';
import { ScormAuthStrategy } from '../guards/scormAuth.strategy';

@Module({
  imports: [
    UsersModule,
    CourseEntityModule,
    CourseAccessCheckerModule,
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
  controllers: [ScormController],
  providers: [ScormService, JwtStrategy, ScormAuthStrategy],
  exports: [ScormService],
})
export class ScormModule {}
