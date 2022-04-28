import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

import { Policy } from '@seaccentral/core/dist/access-control/policy.decorator';
import { District } from '@seaccentral/core/dist/address/District.entity';
import { Province } from '@seaccentral/core/dist/address/Province.entity';
import { Subdistrict } from '@seaccentral/core/dist/address/Subdistrict.entity';
import { LoginSetting } from '@seaccentral/core/dist/admin/Login.setting.entity';
import { PasswordSetting } from '@seaccentral/core/dist/admin/Password.setting.entity';
import { connectionConfig } from '@seaccentral/core/dist/connection';
import { CourseDiscovery } from '@seaccentral/core/dist/course-discovery/CourseDiscovery.entity';
import { Course } from '@seaccentral/core/dist/course/Course.entity';
import { CourseTag } from '@seaccentral/core/dist/course/CourseTag.entity';
import {
  BaseContact,
  ContactCorporate,
  ContactRetail,
  ContactTrial,
} from '@seaccentral/core/dist/crm/contact.entity';
import { CRMModule } from '@seaccentral/core/dist/crm/crm.module';
import { Group } from '@seaccentral/core/dist/group/Group.entity';
import { GroupUser } from '@seaccentral/core/dist/group/GroupUser.entity';
import { Invitation } from '@seaccentral/core/dist/invitation/Invitation.entity';
import { LoggerMiddleware } from '@seaccentral/core/dist/middlewares/logger.middleware';
import { Organization } from '@seaccentral/core/dist/organization/Organization.entity';
import { OrganizationUser } from '@seaccentral/core/dist/organization/OrganizationUser.entity';
import { BillingAddress } from '@seaccentral/core/dist/payment/BillingAddress.entity';
import { Order } from '@seaccentral/core/dist/payment/Order.entity';
import { Subscription } from '@seaccentral/core/dist/payment/Subscription.entity';
import { SubscriptionPlan } from '@seaccentral/core/dist/payment/SubscriptionPlan.entity';
import { TaxInvoice } from '@seaccentral/core/dist/payment/TaxInvoice.entity';
import { Transaction } from '@seaccentral/core/dist/payment/Transaction.entity';
import { RawProductEntityModule } from '@seaccentral/core/dist/raw-product/rawProductEntity.module';
import { SeedModule } from '@seaccentral/core/dist/seed/seed.module';
import { IdentityProviderConfig } from '@seaccentral/core/dist/sso/IdentityProviderConfig.entity';
import { ServiceProviderConfig } from '@seaccentral/core/dist/sso/ServiceProviderConfig.entity';
import { Tag } from '@seaccentral/core/dist/tag/Tag.entity';
import { Role } from '@seaccentral/core/dist/user/Role.entity';
import { RolePolicy } from '@seaccentral/core/dist/user/RolePolicy.entity';
import { UsersModule } from '@seaccentral/core/dist/user/users.module';
import { QueueModule } from '@seaccentral/core/dist/queue/queue.module';

import { AddressModule } from './address/address.module';
import { AdminModule } from './admin/admin.module';
import { BillingAddressModule } from './billing-address/billingAddress.module';
import { CatalogMenuModule } from './catalog-menu/catalog-menu.module';
import { CertificateModule } from './certificate/certificate.module';
import { ContactModule } from './contact/contact.module';
import { CourseDiscoveryModule } from './course-discovery/course-discovery.module';
import { CourseModule } from './course/course.module';
import { TaskModule } from './cron/task.module';
import { GroupModule } from './group/group.module';
import { InstructorModule } from './instructor/instructor.module';
import { InvitationModule } from './invitation/invitation.module';
import { jwplayerPlaylistModule } from './jwplayerPlaylist/jwplayerPlaylist.module';
import { LearningTrackModule } from './learning-track/learningTrack.module';
import { LearningWayModule } from './learning-way/learning-way.module';
import { MaterialsModule } from './materials/materials.module';
import { MediaModule } from './media/media.module';
import { OrganizationModule } from './organization/organization.module';
import { PolicyModule } from './policy/policy.module';
import { ProfessionModule } from './profession/profession.module';
import { ProfileModule } from './profile/profile.module';
import { RoleModule } from './role/role.module';
import { ScormModule } from './scorm/scorm.module';
import { SyncModule } from './sync/sync.module';
import { TagModule } from './tag/tag.module';
import { TaxInvoiceModule } from './tax-invoice/TaxInvoice.module';
import { PromoBannerModule } from './promo-banner/promoBanner.module';
import { TopicModule } from './topic/topic.module';
import { UploadModule } from './upload/upload.module';
import { WebhookModule } from './webhook/webhook.module';
import { UserActivityModule } from './user-activity/userActivity.module';
import { SearchModule } from './search/search.module';
import { AssessmentCenterModule } from './assessment-center/assessmentCenter.module';
import { UserAssignedCourseModule } from './user-assigned-course/userAssignedCourse.module';
import { UserAssignedLearningTrackModule } from './user-assigned-learning-track/userAssignedLearningTrack.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      ...(connectionConfig as TypeOrmModuleAsyncOptions),
      autoLoadEntities: true,
      entities: [
        Course,
        CourseTag,
        CourseDiscovery,
        Subscription,
        Transaction,
        BillingAddress,
        TaxInvoice,
        Order,
        LoginSetting,
        PasswordSetting,
        Organization,
        OrganizationUser,
        Invitation,
        IdentityProviderConfig,
        ServiceProviderConfig,
        Subdistrict,
        Province,
        District,
        BaseContact,
        ContactRetail,
        ContactCorporate,
        ContactTrial,
        SubscriptionPlan,
        Group,
        GroupUser,
        Tag,
        Role,
        Policy,
        RolePolicy,
      ],
    }),
    ScormModule,
    CourseModule,
    CourseDiscoveryModule,
    AdminModule,
    InvitationModule,
    TaskModule,
    OrganizationModule,
    AddressModule,
    ContactModule,
    UploadModule,
    UsersModule,
    WebhookModule,
    GroupModule,
    PolicyModule,
    RoleModule,
    SeedModule,
    ProfileModule,
    BillingAddressModule,
    ProfessionModule,
    RawProductEntityModule,
    SyncModule,
    TagModule,
    TopicModule,
    LearningWayModule,
    CatalogMenuModule,
    MaterialsModule,
    CertificateModule,
    MediaModule,
    jwplayerPlaylistModule,
    CRMModule,
    InstructorModule,
    LearningTrackModule,
    TaxInvoiceModule,
    PromoBannerModule,
    UserActivityModule,
    SearchModule,
    AssessmentCenterModule,
    UserAssignedCourseModule,
    UserAssignedLearningTrackModule,
    QueueModule,
  ],
  controllers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: 'v1/webhook', method: RequestMethod.ALL });
  }
}
