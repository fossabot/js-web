import { User } from './user';

export class IOrder {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  metaData: IOrderMetaData;
  user: User;
  subscriptionPlan: ISubscriptionPlan;
  coupon?: ILinkedCoupon;
}

interface IOrderMetaData {
  grandTotal: string;
  subTotal: string;
  discount: string;
  vat: string;
  vatRate: string;
  price: string;
}

interface ISubscriptionPlan {
  id: string;
  name: string;
  vatRate: string;
  price: string;
  currency: string;
  productId: string;
}

interface ILinkedCoupon {
  id: string;
  couponCode: string;
  couponUniqueNo: string;
  used: boolean;
}
