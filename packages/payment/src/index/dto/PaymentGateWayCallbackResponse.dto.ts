import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { PAYMENT_CHANNEL } from '../../constants/payment';

// Ref: https://developer.2c2p.com/docs/payment-requestresponse-parameters#section-payment-response-parameters
export class PaymentGateWayCallbackResponse {
  @IsString()
  @ApiProperty()
  version: string;

  @IsString()
  @ApiProperty()
  request_timestamp: string;

  @IsString()
  @ApiProperty()
  merchant_id: string;

  @IsString()
  @ApiProperty()
  currency: string;

  @IsString()
  @ApiProperty()
  order_id: string;

  @IsString()
  @ApiProperty()
  amount: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  invoice_no: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  transaction_ref: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  approval_code: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  eci: string;

  @IsString()
  @ApiProperty()
  transaction_datetime: string;

  @IsString()
  @ApiProperty()
  payment_channel: PAYMENT_CHANNEL;

  @IsString()
  @ApiProperty()
  payment_status: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  channel_response_code: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  channel_response_desc: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  masked_pan: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  stored_card_unique_id: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  backend_invoice: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  paid_channel: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  paid_agent: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  recurring_unique_id: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  ippPeriod: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  ippInterestType: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  ippInterestRate: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  ippMerchantAbsorbRate: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  payment_scheme: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  process_by: string;

  @IsOptional()
  @ApiProperty()
  sub_merchant_list: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  issuer_country: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  issuer_bank: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  card_type: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  user_defined_1: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  user_defined_2: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  user_defined_3: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  user_defined_4: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  user_defined_5: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  mcp: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  browser_info: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  mcp_amount: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  mcp_currency: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  mcp_exchange_rate: string;

  @IsString()
  @ApiProperty()
  hash_value: string;
}
