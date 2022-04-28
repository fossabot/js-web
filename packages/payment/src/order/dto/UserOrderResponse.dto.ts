import { Order } from '@seaccentral/core/dist/payment/Order.entity';
import { Exclude, Expose } from 'class-transformer';
import numeral from 'numeral';

@Exclude()
export class UserOrderResponse extends Order {
  @Expose()
  id: string;

  @Expose()
  externalOrderId?: string | undefined;

  @Expose()
  get price() {
    try {
      return numeral(this.metaData?.grandTotal).format('0,0.00');
    } catch {
      return 0;
    }
  }

  @Expose()
  get name() {
    return this.subscriptionPlan.name;
  }

  @Expose()
  createdAt: Date;

  constructor(order: Order) {
    super();
    Object.assign(this, order);
  }
}
