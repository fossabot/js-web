import { Exclude, Expose, Transform } from 'class-transformer';
import { User } from '@seaccentral/core/dist/user/User.entity';
import {
  Order,
  OrderMetadata,
  OrderStatus,
} from '@seaccentral/core/dist/payment/Order.entity';
import { SubscriptionPlan } from '@seaccentral/core/dist/payment/SubscriptionPlan.entity';
import { TaxInvoice } from '@seaccentral/core/dist/payment/TaxInvoice.entity';
import { Transaction } from '@seaccentral/core/dist/payment/Transaction.entity';
import { CouponDetailArRaw } from '@seaccentral/core/dist/raw-product/CouponDetailArRaw.entity';
import numeral from 'numeral';
import { getEnumKeyByEnumValue } from '../../utils/enum';
import {
  PAYMENT_CHANNEL,
  PAYMENT_STATUS_RESPONSE_CODE,
} from '../../constants/payment';
import { IPaymentInfo } from '../interface/IPaymentInfo';

@Exclude()
export class OrderPaymentResponse extends Order {
  @Expose()
  id: string;

  @Expose()
  status: OrderStatus;

  @Expose()
  invoiceNumber: string;

  @Expose()
  createdAt: Date;

  @Expose()
  coupon?: CouponDetailArRaw | undefined;

  @Expose()
  @Transform(({ value }: { value: OrderMetadata }) => {
    const price = numeral(value?.price).format('0,0.00');
    const grandTotal = numeral(value?.grandTotal).format('0,0.00');
    const subTotal = numeral(value?.subTotal).format('0,0.00');
    const discount = numeral(value?.discount).format('0,0.00');
    const vat = numeral(value?.vat).format('0,0.00');
    const vatRate = value?.vatRate || 0;

    return {
      price,
      grandTotal,
      subTotal,
      discount,
      vat,
      vatRate,
    };
  })
  metaData?: OrderMetadata;

  @Expose()
  @Transform(
    ({ value }: { value: User }) =>
      value && {
        id: value.id,
        email: value.email,
        firstName: value.firstName,
        lastName: value.lastName,
        fullName: `${value.firstName} ${value.lastName}`,
        phoneNumber: value.phoneNumber,
      },
  )
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  user: Partial<User>;

  @Expose()
  @Transform(
    ({ value }: { value: SubscriptionPlan }) =>
      value && {
        id: value.id,
        name: value.name,
        productId: value.productId,
        price: value.price,
        vatRate: value.vatRate,
        currency: value.currency,
        createdAt: value.createdAt,
      },
  )
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  subscriptionPlan: Partial<SubscriptionPlan>;

  @Expose()
  @Transform(
    ({ value }: { value: TaxInvoice }) =>
      value && {
        id: value.id,
        taxEntityName: value.taxEntityName,
        taxAddress: value.taxAddress,
        subdistrict: value.subdistrict,
        district: value.district,
        province: value.province,
        country: value.country,
        zipcode: value.zipCode,
        taxId: value.taxId,
        contactPerson: value.contactPerson,
        contactEmail: value.contactEmail,
        contactPhoneNumber: value.contactPhoneNumber,
        billingAddress: value.billingAddress,
      },
  )
  taxInvoice?: TaxInvoice;

  @Expose()
  @Transform(({ value }: { value: Transaction }) => {
    if (!value) return null;

    let paymentInfo: IPaymentInfo | null = null;
    const metaData = JSON.parse(value.metaData || 'false');
    if (metaData) {
      const { payment_channel, payment_status, masked_pan } = metaData;
      paymentInfo = {
        paymentChannel: getEnumKeyByEnumValue(PAYMENT_CHANNEL, payment_channel),
        paymentStatus: getEnumKeyByEnumValue(
          PAYMENT_STATUS_RESPONSE_CODE,
          payment_status,
        ),
        cardEnding:
          masked_pan && masked_pan.length >= 2
            ? masked_pan.substr(-2)
            : undefined,
      };
    }

    return {
      id: value.id,
      createdAt: value.createdAt,
      paymentInfo,
    };
  })
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  transaction?: Transaction;

  constructor(partial: Partial<Order>) {
    super();
    Object.assign(this, partial);
  }
}
