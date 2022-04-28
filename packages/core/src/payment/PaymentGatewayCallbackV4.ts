import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RawPaymentGatewayCallbackV4 {
  /**
   * Payload in JWT format
   */
  @IsString()
  @ApiProperty()
  payload: string;
}

// Ref: https://developer.2c2p.com/docs/api-payment-response-back-end-parameter
/**
 * Sample data
 {
  "cardNo": "411111XXXXXX1111",
  "cardToken": "",
  "merchantID": "JT04",
  "invoiceNo": "aa1467a4-6329-4b14-aafe-f9312076e35b",
  "amount": 6420,
  "monthlyPayment": null,
  "userDefined1": "",
  "userDefined2": "",
  "userDefined3": "",
  "userDefined4": "",
  "userDefined5": "",
  "currencyCode": "THB",
  "recurringUniqueID": "",
  "tranRef": "4582828",
  "referenceNo": "4274514",
  "approvalCode": "985343",
  "eci": "05",
  "transactionDateTime": "20220119203312",
  "agentCode": "TBANK",
  "channelCode": "VI",
  "issuerCountry": "US",
  "issuerBank": "BANK",
  "installmentMerchantAbsorbRate": null,
  "cardType": "CREDIT",
  "idempotencyID": "",
  "paymentScheme": "VI",
  "respCode": "0000",
  "respDesc": "Success"
}
 */
export interface PaymentGatewayCallbackV4 {
  cardNo?: string;
  cardToken?: string;
  merchantID: string;
  invoiceNo: string;
  amount: number;
  monthlyPayment?: string;
  currencyCode: string;
  recurringUniqueID: string;
  tranRef: string;
  referenceNo: string;
  approvalCode: string;
  eci: string;

  // In format yyyyMMddHHmmss
  transactionDateTime: string;

  agentCode: string;
  channelCode: string;
  issuerCountry: string;
  issuerBank: string;
  installmentMerchantAbsorbRate?: number;
  cardType?: string;
  idempotencyID: string;
  paymentScheme: string;
  respCode: string;
  respDesc: string;

  installmentPeriod?: number;
  interestType?: string;
  interestRate?: number;

  userDefined1?: string;
  userDefined2?: string;
}

// https://developer.2c2p.com/docs/payment-inquiry-response-code#section-common-response-code
export enum COMMON_2C2P_RESPONSE_CODE {
  SUCCESS = '0000',
  PENDING = '0001',
  CANCELLED = '0003',
  IN_PROGRESS = '2001',
  TRANSACTION_NOT_FOUND = '2002',
}
