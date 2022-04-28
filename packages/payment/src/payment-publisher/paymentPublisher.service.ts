import { Injectable } from '@nestjs/common';
import { CRMService } from '@seaccentral/core/dist/crm/crm.service';
import { Order } from '@seaccentral/core/dist/payment/Order.entity';
import { Subscription } from '@seaccentral/core/dist/payment/Subscription.entity';
import { PaymentConsumable } from '@seaccentral/core/dist/payment/PaymentConsumble';
import { PaymentGatewayCallbackV4 } from '@seaccentral/core/dist/payment/PaymentGatewayCallbackV4';
import { ARService } from '@seaccentral/core/dist/ar/ar.service';

@Injectable()
export class PaymentPublisherService {
  constructor(
    private readonly crmService: CRMService,
    private readonly arService: ARService,
  ) {}

  private getSubscribers(): PaymentConsumable[] {
    return [this.crmService, this.arService];
  }

  async publishPaymentSuccess(
    order: Order,
    subscription: Subscription,
    payment2c2p: PaymentGatewayCallbackV4,
  ) {
    await Promise.allSettled(
      this.getSubscribers().map((subscriber) =>
        subscriber.onPaymentSuccess(order, subscription, payment2c2p),
      ),
    );
  }

  async publishPaymentFailure(
    order: Order,
    payment2c2p: PaymentGatewayCallbackV4,
  ) {
    await Promise.allSettled(
      this.getSubscribers().map((subscriber) =>
        subscriber.onPaymentFailure(order, payment2c2p),
      ),
    );
  }
}
