import { Module } from '@nestjs/common';
import { CRMModule } from '@seaccentral/core/dist/crm/crm.module';
import { ARModule } from '@seaccentral/core/dist/ar/ar.module';
import { PaymentPublisherService } from './paymentPublisher.service';

@Module({
  imports: [CRMModule, ARModule],
  providers: [PaymentPublisherService],
  exports: [PaymentPublisherService],
})
export class PaymentPublisherModule {}
