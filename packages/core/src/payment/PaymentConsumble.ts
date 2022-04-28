import { Order } from './Order.entity';
import { PaymentGatewayCallbackV4 } from './PaymentGatewayCallbackV4';
import { Subscription } from './Subscription.entity';

export interface PaymentConsumable {
  onPaymentSuccess: (
    order: Order,
    subscription: Subscription,
    payment2c2p: PaymentGatewayCallbackV4,
  ) => unknown;

  onPaymentFailure: (
    order: Order,
    payment2c2p: PaymentGatewayCallbackV4,
  ) => unknown;
}
