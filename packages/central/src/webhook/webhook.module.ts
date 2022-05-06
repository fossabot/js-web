import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '@seaccentral/core/dist/user/User.entity';
import { Role } from '@seaccentral/core/dist/user/Role.entity';
import { UsersModule } from '@seaccentral/core/dist/user/users.module';
import { Invitation } from '@seaccentral/core/dist/invitation/Invitation.entity';
import { Subscription } from '@seaccentral/core/dist/payment/Subscription.entity';
import { UserThirdParty } from '@seaccentral/core/dist/user/UserThirdParty.entity';
import { Organization } from '@seaccentral/core/dist/organization/Organization.entity';
import { UserAuthProvider } from '@seaccentral/core/dist/user/UserAuthProvider.entity';
import { SubscriptionPlan } from '@seaccentral/core/dist/payment/SubscriptionPlan.entity';
import { OrganizationUser } from '@seaccentral/core/dist/organization/OrganizationUser.entity';
import { RawProductEntityModule } from '@seaccentral/core/dist/raw-product/rawProductEntity.module';
import { ExternalProviderModule } from '@seaccentral/core/dist/external-package-provider/external.provider.module';

import { CoreAddressModule } from '@seaccentral/core/dist/address/coreAddress.module';
import { PendingMember } from '@seaccentral/core/dist/user/PendingMember.entity';
import { MemberService } from './member.service';
import { WebhookController } from './webhook.controller';
import { RawProductService } from './RawProduct.service';
import { CRMAuthStrategy } from '../guards/crmAuth.strategy';
import { ARProductRawService } from './ARProductRaw.service';
import { ARCouponRawService } from './ARCouponRaw.service';
import { AREligibleSkuRawService } from './AREligibleSkuRaw.service';
import { GroupModule } from '../group/group.module';

@Module({
  imports: [
    ExternalProviderModule,
    UsersModule,
    RawProductEntityModule,
    GroupModule,
    CoreAddressModule,
    TypeOrmModule.forFeature([
      User,
      UserAuthProvider,
      OrganizationUser,
      UserThirdParty,
      Role,
      Invitation,
      SubscriptionPlan,
      Subscription,
      Organization,
      PendingMember,
    ]),
  ],
  controllers: [WebhookController],
  providers: [
    MemberService,
    CRMAuthStrategy,
    RawProductService,
    ARProductRawService,
    ARCouponRawService,
    AREligibleSkuRawService,
  ],
  exports: [MemberService],
})
export class WebhookModule {}
