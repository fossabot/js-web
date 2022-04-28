import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { Group } from '@seaccentral/core/dist/group/Group.entity';
import { JwtStrategy } from '@seaccentral/core/dist/auth/jwt.strategy';
import { UsersModule } from '@seaccentral/core/dist/user/users.module';
import { GroupUser } from '@seaccentral/core/dist/group/GroupUser.entity';
import { SearchModule } from '@seaccentral/core/dist/search/search.module';
import { RedisCacheModule } from '@seaccentral/core/dist/redis/redisCache.module';
import { CourseEntityModule } from '@seaccentral/core/dist/course/courseEntity.module';
import { CoreMaterialModule } from '@seaccentral/core/dist/material/coreMaterial.module';
import { LearningTrackEntityModule } from '@seaccentral/core/dist/learning-track/learningTrackEntity.module';
import { CertificateUnlockRuleLearningTrackItem } from '@seaccentral/core/dist/certificate/CertificateUnlockRuleLearningTrackItem.entity';
import { QueueModule } from '@seaccentral/core/dist/queue/queue.module';

import { CourseModule } from '../course/course.module';
import { LearningTrackService } from './learningTrack.service';
import { LearningTrackController } from './learningTrack.controller';
import { UserLearningTrackService } from './userLearningTrack.service';
import { LearningTrackSearchService } from './learningTrackSearch.service';
import { UserLearningTrackController } from './userLearningTrack.controller';
import { InternalMaterialsService } from '../materials/internalMaterials.service';
import { LearningTrackAccessControlService } from './learningTrackAccessControl.service';
import { LearningTrackDirectAccessController } from './learningTrackDirectAccess.controller';

@Module({
  imports: [
    UsersModule,
    SearchModule,
    CourseEntityModule,
    CoreMaterialModule,
    CourseModule,
    LearningTrackEntityModule,
    RedisCacheModule,
    QueueModule,
    TypeOrmModule.forFeature([
      CertificateUnlockRuleLearningTrackItem,
      GroupUser,
      Group,
    ]),
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
  controllers: [
    LearningTrackController,
    UserLearningTrackController,
    LearningTrackDirectAccessController,
  ],
  providers: [
    LearningTrackService,
    JwtStrategy,
    InternalMaterialsService,
    LearningTrackSearchService,
    UserLearningTrackService,
    LearningTrackAccessControlService,
  ],
  exports: [
    LearningTrackSearchService,
    LearningTrackService,
    LearningTrackAccessControlService,
  ],
})
export class LearningTrackModule {}
