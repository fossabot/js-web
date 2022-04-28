import * as Yup from 'yup';

export interface OrderPaymentSummaryDto {
  period: {
    fromTimestamp: number;
    toTimestamp: number;
  };
  newUser: number;
  renewUser: number;
  expiredUser: number;
  unsuccessfulPayment: number;
  packageType: string[];
  memberType: string[];
  revenue: number;
}

export const orderPaymentSummarySchema = Yup.object({
  period: Yup.object().shape({
    fromTimestamp: Yup.number(),
    toTimestamp: Yup.number(),
  }),
  newUser: Yup.number(),
  renewUser: Yup.number(),
  expiredUser: Yup.number(),
  unsuccessfulPayment: Yup.number(),
  packageType: Yup.array().of(Yup.string()),
  memberType: Yup.array().of(Yup.string()),
  revenue: Yup.number(),
});
