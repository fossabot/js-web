import { PAYMENT_OPTIONS } from '@seaccentral/core/dist/crm/payment';

export interface FrontendCallbackDto {
  invoiceNo: string;
  channelCode: PAYMENT_OPTIONS;
  respCode: string;
  respDesc: string;
}
