import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  BaseContact,
  ContactCorporate,
  ContactRetail,
  ContactTrial,
} from './contact.entity';
import { CRMService } from './crm.service';
import { Order } from '../payment/Order.entity';
import { TaxInvoice } from '../payment/TaxInvoice.entity';
import { SubscriptionPlan } from '../payment/SubscriptionPlan.entity';
import { Subdistrict } from '../address/Subdistrict.entity';
import { Subscription } from '../payment/Subscription.entity';
import { ContactTrialService } from './contact.trial.service';
import { ContactRetailService } from './contact.retail.service';
import { BillingAddress } from '../payment/BillingAddress.entity';
import { ContactCorporateService } from './contact.corporate.service';
import { OrganizationUser } from '../organization/OrganizationUser.entity';
import { CoreAddressModule } from '../address/coreAddress.module';
import { UsersModule } from '../user/users.module';
import { CRMMemberService } from './crmMember.service';
import { CouponMasterArRaw } from '../raw-product/CouponMasterArRaw.entity';
import { CouponDetailArRaw } from '../raw-product/CouponDetailArRaw.entity';

@Module({
  imports: [
    HttpModule,
    CoreAddressModule,
    UsersModule,
    TypeOrmModule.forFeature([
      BaseContact,
      ContactCorporate,
      ContactRetail,
      ContactTrial,
      Order,
      TaxInvoice,
      BillingAddress,
      SubscriptionPlan,
      Subscription,
      Subdistrict,
      OrganizationUser,
      CouponDetailArRaw,
      CouponMasterArRaw,
    ]),
  ],
  providers: [
    ContactCorporateService,
    ContactRetailService,
    ContactTrialService,
    CRMService,
    CRMMemberService,
  ],
  exports: [
    ContactCorporateService,
    ContactRetailService,
    ContactTrialService,
    CRMService,
    CRMMemberService,
  ],
})
export class CRMModule {}
