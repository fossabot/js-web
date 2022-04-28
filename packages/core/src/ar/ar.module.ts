import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { CouponDetailArRaw } from '../raw-product/CouponDetailArRaw.entity';
import { CouponMasterArRaw } from '../raw-product/CouponMasterArRaw.entity';
import { ARService } from './ar.service';
import { ARFailedOrder } from './ARFailedOrder.entity';
import { Order } from '../payment/Order.entity';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      CouponDetailArRaw,
      CouponMasterArRaw,
      ARFailedOrder,
      Order,
    ]),
    ScheduleModule.forRoot(),
  ],
  providers: [ARService],
  exports: [ARService],
})
export class ARModule {}
