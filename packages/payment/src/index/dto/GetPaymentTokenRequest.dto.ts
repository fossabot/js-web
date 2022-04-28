import { PAYMENT_OPTIONS } from '@seaccentral/core/dist/crm/payment';

// more field is here https://developer.2c2p.com/docs/api-payment-token-request-parameter
export interface GetPaymentTokenRequestDto {
  merchantID: string;
  invoiceNo: string;
  description: string;
  amount: number;
  currencyCode: string;
  paymentChannel: PAYMENT_OPTIONS[];
  paymentExpiry: string;
  frontendReturnUrl: string;
  backendReturnUrl?: string;
  userDefined1?: string;
  userDefined2?: string;
}
