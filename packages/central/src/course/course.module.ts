import { ConfigModule, ConfigService } from '@nestjs/config';
import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from '@seaccentral/core/dist/auth/jwt.strategy';
import { CertificateUnlockRule } from '@seaccentral/core/dist/certificate/CertificateUnlockRule.entity';
import { CertificateUnlockRuleCourseItem } from '@seaccentral/core/dist/certificate/CertificateUnlockRuleCourseItem.entity';
import { UserCertificate } from '@seaccentral/core/dist/certificate/UserCertificate.entity';
import { CourseAccessCheckerModule } from '@seaccentral/core/dist/course/courseAccessChecker.module';
import { CourseEntityModule } from '@seaccentral/core/dist/course/courseEntity.module';
import { UserCourseSessionCancellationLog } from '@seaccentral/core/dist/course/UserCourseSessionCancellationLog.entity';
import { Group } from '@seaccentral/core/dist/group/Group.entity';
import { GroupUser } from '@seaccentral/core/dist/group/GroupUser.entity';
import { UserEnrolledLearningTrack } from '@seaccentral/core/dist/learning-track/UserEnrolledLearningTrack.entity';
import { LearningWay } from '@seaccentral/core/dist/learning-way/LearningWay.entity';
import { CoreMaterialModule } from '@seaccentral/core/dist/material/coreMaterial.module';
import { Organization } from '@seaccentral/core/dist/organization/Organization.entity';
import { OrganizationUser } from '@seaccentral/core/dist/organization/OrganizationUser.entity';
import { CorePaymentModule } from '@seaccentral/core/dist/payment/corePayment.module';
import { QueueModule } from '@seaccentral/core/dist/queue/queue.module';
import { RedisCacheModule } from '@seaccentral/core/dist/redis/redisCache.module';
import { SearchModule as CoreSearchModule } from '@seaccentral/core/dist/search/search.module';
import { Topic } from '@seaccentral/core/dist/topic/Topic.entity';
import { UsersModule } from '@seaccentral/core/dist/user/users.module';
import { NotificationModule } from '@seaccentral/core/dist/notification/Notification.module';
import { InternalMaterialsService } from '../materials/internalMaterials.service';

import { CourseService } from './course.service';
import { ScormService } from '../scorm/scorm.service';
import { SearchModule } from '../search/search.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { CourseController } from './course.controller';

import { CourseAccessControlService } from './courseAccessControl.service';
import { CourseActivitiesController } from './courseActivities.controller';
import { CourseActivitiesRecordService } from './courseActivitiesRecord.service';
import { CourseDirectAccessController } from './courseDirectAccess.controller';
import { CourseOutlineController } from './courseOutline.controller';
import { CourseOutlineService } from './courseOutline.service';
import { CourseOutlineBundleController } from './courseOutlineBundle.controller';
import { CourseOutlineBundleService } from './courseOutlineBundle.service';
import { CourseRuleController } from './courseRule.controller';
import { CourseRuleService } from './courseRule.service';
import { CourseSearchService } from './courseSearch.service';
import { CourseSessionController } from './courseSession.controller';
import { CourseSessionService } from './courseSession.service';
import { CourseSessionCancellationService } from './courseSessionCancellation.service';
import { CourseSessionManagementController } from './courseSessionManagement.controller';
import { CourseSessionManagementService } from './courseSessionManagement.service';
import { CourseSessionReportService } from './courseSessionReport.service';
import { UserCourseController } from './userCourse.controller';
import { UserCourseService } from './userCourse.service';
import { UserCourseProgressService } from './userCourseProgress.service';
import { CertificateModule } from '../certificate/certificate.module';

@Module({
  imports: [
    UsersModule,
    NotificationModule,
    SearchModule,
    CoreSearchModule,
    CorePaymentModule,
    CoreMaterialModule,
    CourseEntityModule,
    RedisCacheModule,
    SubscriptionModule,
    CourseAccessCheckerModule,
    QueueModule,
    forwardRef(() => CertificateModule),
    TypeOrmModule.forFeature([
      Topic,
      Group,
      GroupUser,
      LearningWay,
      Organization,
      UserCertificate,
      OrganizationUser,
      CertificateUnlockRule,
      UserEnrolledLearningTrack,
      CertificateUnlockRuleCourseItem,
      UserCourseSessionCancellationLog,
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
    CourseController,
    CourseRuleController,
    UserCourseController,
    CourseOutlineController,
    CourseSessionController,
    CourseActivitiesController,
    CourseDirectAccessController,
    CourseOutlineBundleController,
    CourseSessionManagementController,
  ],
  providers: [
    JwtStrategy,
    ScormService,
    CourseService,
    CourseRuleService,
    UserCourseService,
    CourseSearchService,
    CourseOutlineService,
    CourseSessionService,
    InternalMaterialsService,
    UserCourseProgressService,
    CourseOutlineBundleService,
    CourseAccessControlService,
    CourseSessionReportService,
    CourseActivitiesRecordService,
    CourseSessionManagementService,
    CourseSessionCancellationService,
    CourseSessionCancellationService,
  ],
  exports: [
    CourseService,
    CourseRuleService,
    CourseSearchService,
    CourseSessionService,
    CourseOutlineService,
    CourseAccessControlService,
    UserCourseProgressService,
  ],
})
export class CourseModule {}
