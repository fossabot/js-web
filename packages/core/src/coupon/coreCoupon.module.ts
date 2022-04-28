import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CouponLock } from './CouponLock.entity';
import { CouponDetailArRaw } from '../raw-product/CouponDetailArRaw.entity';
import { CouponMasterArRaw } from '../raw-product/CouponMasterArRaw.entity';
import { EligibleSkuCodeArRaw } from '../raw-product/EligibleSkuCodeArRaw.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CouponLock,
      CouponDetailArRaw,
      CouponMasterArRaw,
      EligibleSkuCodeArRaw,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class CoreCouponModule {}
