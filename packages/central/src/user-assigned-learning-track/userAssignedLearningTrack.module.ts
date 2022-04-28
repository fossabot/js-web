import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from '@seaccentral/core/dist/group/Group.entity';
import { GroupUser } from '@seaccentral/core/dist/group/GroupUser.entity';
import { LearningTrackEntityModule } from '@seaccentral/core/dist/learning-track/learningTrackEntity.module';
import { Organization } from '@seaccentral/core/dist/organization/Organization.entity';
import { OrganizationUser } from '@seaccentral/core/dist/organization/OrganizationUser.entity';
import { QueueModule } from '@seaccentral/core/dist/queue/queue.module';
import { UsersModule } from '@seaccentral/core/dist/user/users.module';

import { GroupModule } from '../group/group.module';
import { UserAssignedLearningTrackController } from './userAssignedLearningTrack.controller';
import { UserAssignedLearningTrackService } from './userAssignedLearningTrack.service';

@Module({
  imports: [
    LearningTrackEntityModule,
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
  ],
  controllers: [UserAssignedLearningTrackController],
  providers: [UserAssignedLearningTrackService],
  exports: [UserAssignedLearningTrackService],
})
export class UserAssignedLearningTrackModule {}
