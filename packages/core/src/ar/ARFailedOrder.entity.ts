import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { Order } from '../payment/Order.entity';
import { Base } from '../base/Base.entity';

export interface IFailReason {
  status?: any;
  data?: any;
  headers?: any;
}

@Entity()
@Unique('failed_order_unique', ['orderId'])
export class ARFailedOrder extends Base {
  @Column()
  orderId: string;

  @ManyToOne(() => Order, { onDelete: 'CASCADE', eager: true })
  order: Order;

  @Column({ type: 'timestamptz' })
  dueRetry: Date;

  @Column({ default: 0 })
  attempt: number;

  @Column({ type: 'jsonb', nullable: true })
  reason?: IFailReason;
}
