import { Entity, Column, Index, ManyToOne } from 'typeorm';

import { Base } from '../base/Base.entity';
import { ProductCurrencyRaw } from './ProductCurrencyRaw.entity';
import { ProductPartnerRaw } from './ProductPartnerRaw.entity';
import { ProductSKUGroupRaw } from './ProductSKUGroupRaw.entity';
import { ProductSubGroupRaw } from './ProductSubGroupRaw.entity';
import { ProductUOMRaw } from './ProductUOMRaw.entity';

@Entity()
export class ProductSKURaw extends Base {
  @Column({ nullable: false, unique: true })
  @Index()
  code: string;

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: false })
  price: string;

  @Column({ nullable: false })
  productAvailability: string;

  @Column({ nullable: false, default: 'Active' })
  status: string;

  // Rest of the colums are used only for business metrics.
  // Need to confirm the usage in application

  @Column({ nullable: true })
  eligibleCountryName?: string;

  @Column({ nullable: true })
  subProductGroupName?: string;

  @ManyToOne(() => ProductSubGroupRaw, {
    nullable: true,
  })
  productSubGroup?: ProductSubGroupRaw;

  @Column({ nullable: true })
  skuGroupName?: string;

  @ManyToOne(() => ProductSKUGroupRaw, {
    nullable: true,
  })
  skuGroup?: ProductSKUGroupRaw;

  @Column({ nullable: true })
  currencyName?: string;

  @ManyToOne(() => ProductCurrencyRaw, {
    nullable: true,
  })
  currency?: ProductCurrencyRaw;

  @Column({ nullable: true })
  uomName?: string;

  @ManyToOne(() => ProductUOMRaw, {
    nullable: true,
  })
  uom?: ProductUOMRaw;

  @Column({ nullable: true })
  partnerName?: string;

  @ManyToOne(() => ProductPartnerRaw, {
    nullable: true,
  })
  partner?: ProductPartnerRaw;

  @Column({ nullable: true })
  unitPerSKU?: string;

  @Column({ nullable: true })
  deliveryFormat?: string;

  @Column({ nullable: true })
  revenueType?: string;

  @Column({ nullable: true })
  thirdPartyLicenseFee?: string;

  @Column({ nullable: true })
  shelfLife?: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: false })
  standardCost: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: false })
  packageDay: string;
}
