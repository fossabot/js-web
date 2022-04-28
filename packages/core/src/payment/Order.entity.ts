import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { Base } from '../base/Base.entity';
import { User } from '../user/User.entity';
import { Transaction } from './Transaction.entity';
import { SubscriptionPlan } from './SubscriptionPlan.entity';
import { CouponDetailArRaw } from '../raw-product/CouponDetailArRaw.entity';

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
  FAILED = 'FAILED',
}

export interface OrderMetadata {
  grandTotal: number;
  subTotal: number;
  discount?: number | undefined | null;
  vat: number;
  vatRate: number;
  price: number;
}

@Entity()
export class Order extends Base {
  @Column({ type: 'enum', enum: OrderStatus })
  status: OrderStatus;

  @Column({ nullable: true })
  planId?: string;

  @ManyToOne(() => SubscriptionPlan, { nullable: false, eager: true })
  subscriptionPlan: SubscriptionPlan;

  @Column({ nullable: true })
  externalOrderId?: string;

  @Column()
  issueTaxInvoice: boolean;

  @Column({ nullable: true })
  invoiceNumber?: string;

  @Column({ default: false, nullable: false })
  isSyncToCRM!: boolean;

  @Column()
  userId: string;

  @ManyToOne(() => User, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE',
  })
  user!: User;

  @Column({ type: 'jsonb', nullable: true })
  metaData?: OrderMetadata;

  @ManyToOne(() => CouponDetailArRaw, {
    nullable: true,
    eager: true,
  })
  coupon?: CouponDetailArRaw;

  @Column({ nullable: true })
  couponId?: string;

  @OneToMany(() => Transaction, (transaction) => transaction.order)
  transaction!: Transaction[];

  @Column({ nullable: true })
  paymentToken?: string;

  @Column({ nullable: true })
  dealId?: string; // for tracking in AR and CRM
}
