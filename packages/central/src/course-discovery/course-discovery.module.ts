import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { Course } from '@seaccentral/core/dist/course/Course.entity';
import { UsersModule } from '@seaccentral/core/dist/user/users.module';
import { RedisCacheModule } from '@seaccentral/core/dist/redis/redisCache.module';
import { CourseDiscovery } from '@seaccentral/core/dist/course-discovery/CourseDiscovery.entity';
import { CourseAccessCheckerModule } from '@seaccentral/core/dist/course/courseAccessChecker.module';

import { CourseDiscoveryService } from './course-discovery.service';
import { CourseDiscoveryController } from './course-discovery.controller';

@Module({
  imports: [
    CourseAccessCheckerModule,
    RedisCacheModule,
    TypeOrmModule.forFeature([Course, CourseDiscovery]),
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
    UsersModule,
  ],
  controllers: [CourseDiscoveryController],
  providers: [CourseDiscoveryService],
})
export class CourseDiscoveryModule {}
