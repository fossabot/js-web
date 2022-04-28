import { Injectable } from '@nestjs/common';
import { SubscriptionPlan } from '@seaccentral/core/dist/payment/SubscriptionPlan.entity';
import { PriceBuilder } from '@seaccentral/core/dist/utils/priceBuilder';
import { sum } from 'lodash';
import numeral from 'numeral';
import { CartTotalDto } from './dto/CartTotal.dto';

@Injectable()
export class CartService {
  total(plan: SubscriptionPlan, discount = 0): CartTotalDto {
    const subTotal = plan.price;
    const { vatRate } = plan;
    const vat = new PriceBuilder(+plan.price)
      .discount(discount)
      .valueVat(+plan.vatRate);
    const rawGrandTotal = sum([+subTotal, -discount, +vat]);
    const grandTotal = this.isMin2c2pChargeable(rawGrandTotal)
      ? rawGrandTotal
      : 0;

    return {
      subTotal: numeral(subTotal).format('0.00'),
      discount: numeral(discount).format('0.00'),
      vatRate: numeral(vatRate).format('0'),
      vat: numeral(vat).format('0.00'),
      grandTotal: numeral(grandTotal).format('0.00'),
    };
  }

  requirePayment(total: number) {
    return this.isMin2c2pChargeable(total);
  }

  private isMin2c2pChargeable(total: number) {
    return total >= 0.01;
  }
}
