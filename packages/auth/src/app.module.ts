import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

import { connectionConfig } from '@seaccentral/core/dist/connection';
import { LoginSetting } from '@seaccentral/core/dist/admin/Login.setting.entity';
import { Invitation } from '@seaccentral/core/dist/invitation/Invitation.entity';
import { PasswordSetting } from '@seaccentral/core/dist/admin/Password.setting.entity';
import { Organization } from '@seaccentral/core/dist/organization/Organization.entity';
import { SubscriptionPlan } from '@seaccentral/core/dist/payment/SubscriptionPlan.entity';
import { OrganizationUser } from '@seaccentral/core/dist/organization/OrganizationUser.entity';
import { ServiceProviderConfig } from '@seaccentral/core/dist/sso/ServiceProviderConfig.entity';
import { IdentityProviderConfig } from '@seaccentral/core/dist/sso/IdentityProviderConfig.entity';

import { UsersModule } from '@seaccentral/core/dist/user/users.module';
import { SeedModule } from '@seaccentral/core/dist/seed/seed.module';
import { RawProductEntityModule } from '@seaccentral/core/dist/raw-product/rawProductEntity.module';
import { SSOModule } from './sso/sso.module';
import { TaskModule } from './cron/task.module';
import { AuthModule } from './index/index.module';
import { SocialModule } from './social/social.module';

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
        LoginSetting,
        Organization,
        OrganizationUser,
        Invitation,
        PasswordSetting,
        ServiceProviderConfig,
        IdentityProviderConfig,
        SubscriptionPlan,
      ],
    }),
    SocialModule,
    AuthModule,
    RawProductEntityModule,
    UsersModule,
    TaskModule,
    SSOModule,
    SeedModule,
  ],
})
export class AppModule {}
