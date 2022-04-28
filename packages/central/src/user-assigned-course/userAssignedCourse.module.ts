import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseEntityModule } from '@seaccentral/core/dist/course/courseEntity.module';
import { Group } from '@seaccentral/core/dist/group/Group.entity';
import { GroupUser } from '@seaccentral/core/dist/group/GroupUser.entity';
import { Organization } from '@seaccentral/core/dist/organization/Organization.entity';
import { OrganizationUser } from '@seaccentral/core/dist/organization/OrganizationUser.entity';
import { QueueModule } from '@seaccentral/core/dist/queue/queue.module';
import { UsersModule } from '@seaccentral/core/dist/user/users.module';
import { RedisCacheModule } from '@seaccentral/core/dist/redis/redisCache.module';

import { GroupModule } from '../group/group.module';
import { UserAssignedCourseController } from './userAssignedCourse.controller';
import { UserAssignedCourseService } from './userAssignedCourse.service';

@Module({
  imports: [
    CourseEntityModule,
    GroupModule,
    QueueModule,
    TypeOrmModule.forFeature([
      Organization,
      OrganizationUser,
      Group,
      GroupUser,
    ]),
    QueueModule,
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
    RedisCacheModule,
  ],
  controllers: [UserAssignedCourseController],
  providers: [UserAssignedCourseService],
  exports: [UserAssignedCourseService],
})
export class UserAssignedCourseModule {}
