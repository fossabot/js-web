import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { CoreCertificateModule } from '@seaccentral/core/dist/certificate/coreCertificate.module';

import { connectionConfig } from '@seaccentral/core/dist/connection';
import { LoginSetting } from '@seaccentral/core/dist/admin/Login.setting.entity';
import { Invitation } from '@seaccentral/core/dist/invitation/Invitation.entity';
import { LearningTrackEntityModule } from '@seaccentral/core/dist/learning-track/learningTrackEntity.module';
import { Organization } from '@seaccentral/core/dist/organization/Organization.entity';
import { OrganizationUser } from '@seaccentral/core/dist/organization/OrganizationUser.entity';
import { ServiceProviderConfig } from '@seaccentral/core/dist/sso/ServiceProviderConfig.entity';
import { IdentityProviderConfig } from '@seaccentral/core/dist/sso/IdentityProviderConfig.entity';

import {
  BaseContact,
  ContactCorporate,
  ContactRetail,
  ContactTrial,
} from '@seaccentral/core/dist/crm/contact.entity';
import { CRMModule } from '@seaccentral/core/dist/crm/crm.module';
import { SeedModule } from '@seaccentral/core/dist/seed/seed.module';
import { UsersModule } from '@seaccentral/core/dist/user/users.module';
import { UserThirdParty } from '@seaccentral/core/dist/user/UserThirdParty.entity';
import { CorePaymentModule } from '@seaccentral/core/dist/payment/corePayment.module';
import { RawProductEntityModule } from '@seaccentral/core/dist/raw-product/rawProductEntity.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlanModule } from './plan/plan.module';
import { IndexModule } from './index/index.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { OrderModule } from './order/order.module';
import { CartModule } from './cart/cart.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      ...(connectionConfig as TypeOrmModuleAsyncOptions),
      autoLoadEntities: true,
      entities: [
        BaseContact,
        ContactCorporate,
        ContactRetail,
        ContactTrial,
        LoginSetting,
        Invitation,
        Organization,
        OrganizationUser,
        ServiceProviderConfig,
        IdentityProviderConfig,
        UserThirdParty,
      ],
    }),
    SeedModule,
    IndexModule,
    DashboardModule,
    PlanModule,
    SubscriptionModule,
    CoreCertificateModule,
    LearningTrackEntityModule,
    CRMModule,
    UsersModule,
    CorePaymentModule,
    RawProductEntityModule,
    OrderModule,
    CartModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
