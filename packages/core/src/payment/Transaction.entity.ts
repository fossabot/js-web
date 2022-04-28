import { Entity, Column, ManyToOne } from 'typeorm';
import { Base } from '../base/Base.entity';
import { Order } from './Order.entity';

@Entity()
export class Transaction extends Base {
  @Column({ length: 50 })
  status: string;

  @Column()
  transactionRef: string;

  @Column({ length: 50 })
  amount: string;

  @Column({ length: 50, nullable: true })
  merchantId?: string;

  @Column({ length: 50, nullable: true })
  approvalCode?: string;

  @Column({ length: 50, nullable: true })
  ippPeriod?: string;

  @Column({ length: 50, nullable: true })
  ippInterestType?: string;

  @Column({ length: 50, nullable: true })
  ippInterestRate?: string;

  @Column({ length: 50, nullable: true })
  ippMerchantAbsorbRate?: string;

  @Column({ length: 255, nullable: true })
  invoiceNumber?: string;

  @Column({ length: 255, nullable: true })
  backendInvoiceNumber?: string;

  @Column({ length: 255, nullable: true })
  paymentChannel?: string;

  @Column({ length: 255, nullable: true })
  paymentResponseCode?: string;

  @Column({ length: 255, nullable: true })
  paymentResponseDescription?: string;

  @Column({ length: 50, nullable: true })
  currencyCode: string;

  @Column({ type: 'text', nullable: true })
  metaData?: string;

  @Column()
  orderId: string;

  @ManyToOne(() => Order, {
    nullable: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  order?: Order;
}
