import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductUOMRaw } from './ProductUOMRaw.entity';
import { ProductSKURaw } from './ProductSKURaw.entity';
import { ProductItemRaw } from './ProductItemRaw.entity';
import { ProductGroupRaw } from './ProductGroupRaw.entity';
import { ProductPartnerRaw } from './ProductPartnerRaw.entity';
import { ProductCountryRaw } from './ProductCountryRaw.entity';
import { ProductSKULineRaw } from './ProductSKULineRaw.entity';
import { ProductCurrencyRaw } from './ProductCurrencyRaw.entity';
import { ProductSKUGroupRaw } from './ProductSKUGroupRaw.entity';
import { ProductSubGroupRaw } from './ProductSubGroupRaw.entity';
import { ProductPromotionRaw } from './ProductPromotionRaw.entity';
import { ProductArRaw } from './ProductArRaw.entity';
import { CouponMasterArRaw } from './CouponMasterArRaw.entity';
import { CouponDetailArRaw } from './CouponDetailArRaw.entity';
import { EligibleSkuCodeArRaw } from './EligibleSkuCodeArRaw.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductCountryRaw,
      ProductCurrencyRaw,
      ProductGroupRaw,
      ProductItemRaw,
      ProductPartnerRaw,
      ProductPromotionRaw,
      ProductSKUGroupRaw,
      ProductSKULineRaw,
      ProductSKURaw,
      ProductSubGroupRaw,
      ProductUOMRaw,
      ProductArRaw,
      CouponMasterArRaw,
      CouponDetailArRaw,
      EligibleSkuCodeArRaw,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class RawProductEntityModule {}
