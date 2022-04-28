import { CouponDetailArRaw } from './couponDetailArRaw';
import { SubscriptionPlan } from './subscriptionPlan';

export interface ICartTotal {
  subTotal: string;

  discount?: string | null;

  vat: string;

  vatRate: string;

  grandTotal: string;
}

export interface ICoupon {
  coupon: CouponDetailArRaw;

  lockExpiresOn: string;
}

export interface ICart {
  plan: SubscriptionPlan;

  total: ICartTotal;

  coupon?: ICoupon;
}
