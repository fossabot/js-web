import { SubscriptionPlan } from '@seaccentral/core/dist/payment/SubscriptionPlan.entity';
import { CouponDetailArRaw } from '@seaccentral/core/dist/raw-product/CouponDetailArRaw.entity';
import { CartTotalDto } from './CartTotal.dto';

export interface CouponResponseDto {
  coupon: CouponDetailArRaw;

  lockExpiresOn: Date;
}

export class CartResponseDto {
  plan: SubscriptionPlan;

  total: CartTotalDto;

  coupon?: CouponResponseDto;
}
