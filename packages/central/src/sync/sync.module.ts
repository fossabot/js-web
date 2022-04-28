import { Module } from '@nestjs/common';
import { RawProductEntityModule } from '@seaccentral/core/dist/raw-product/rawProductEntity.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionPlan } from '@seaccentral/core/dist/payment/SubscriptionPlan.entity';
import { SyncController } from './sync.controller';
import { SyncAuthStrategy } from '../guards/syncAuth.strategy';
import { RawProductService } from '../webhook/RawProduct.service';
import { ARProductRawService } from '../webhook/ARProductRaw.service';

@Module({
  imports: [
    RawProductEntityModule,
    TypeOrmModule.forFeature([SubscriptionPlan]),
  ],
  controllers: [SyncController],
  providers: [SyncAuthStrategy, RawProductService, ARProductRawService],
})
export class SyncModule {}
