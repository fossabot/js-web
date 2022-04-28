import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreAddressModule } from '../address/coreAddress.module';
import { BillingAddress } from './BillingAddress.entity';
import { Order } from './Order.entity';
import { Subscription } from './Subscription.entity';
import { SubscriptionPlan } from './SubscriptionPlan.entity';
import { TaxInvoice } from './TaxInvoice.entity';
import { Transaction } from './Transaction.entity';

@Module({
  imports: [
    CoreAddressModule,
    TypeOrmModule.forFeature([
      BillingAddress,
      Order,
      Subscription,
      SubscriptionPlan,
      TaxInvoice,
      Transaction,
    ]),
  ],
  exports: [TypeOrmModule, CoreAddressModule],
})
export class CorePaymentModule {}
