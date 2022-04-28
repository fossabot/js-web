import { Column, CreateDateColumn, Entity } from 'typeorm';
import { Base } from '../base/Base.entity';

export enum PromoType {
  Discount = 'Discount',
  FreeTrial = 'Free Trial',
  Premium = 'Premium',
}

export enum CouponType {
  Regular = 'Regular',
  Seasonal = 'Seasonal',
}

export enum DiscountUOM {
  THB = 'THB',
  Percent = '%',
}

export enum EligibleSkuType {
  All = 'ALL',
  BySKU = 'By SKU',
}

@Entity()
export class CouponMasterArRaw extends Base {
  @Column({ unique: true })
  couponCode: string;

  @Column()
  couponName: string;

  @Column()
  promoType: string;

  @Column()
  couponType: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  promotion: string;

  @Column()
  discountUom: string;

  @Column()
  status: string;

  @CreateDateColumn({ type: 'timestamptz', nullable: true })
  startDate: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  endDate: Date;

  @Column()
  quota: number;

  @Column()
  redeem: number;

  @Column()
  remain: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  campaignBudget: string;

  @Column({ type: 'text', nullable: true })
  budgetUom: string | null;

  @Column({ type: 'text', nullable: true })
  referenceCampaignName: string | null;

  @Column({ type: 'text', nullable: true })
  usageCondition: string | null;

  @Column()
  productGroup: string;

  @Column()
  subProductGroup: string;

  @Column()
  eligibleSkuType: string;

  @Column()
  createBy: string;

  @Column({ type: 'timestamptz' })
  updateDate: Date;
}
