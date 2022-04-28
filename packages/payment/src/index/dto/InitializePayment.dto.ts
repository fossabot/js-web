/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import {
  OfficeType,
  TaxType,
} from '@seaccentral/core/dist/payment/TaxInvoice.entity';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsBoolean,
  ValidateIf,
  ValidateNested,
  Matches,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  EMAIL_PATTERN,
  TH_PHONE_REGEX,
} from '@seaccentral/core/dist/utils/constants';
import { PAYMENT_OPTIONS } from '@seaccentral/core/dist/external-package-provider/instancy.service';

export class TaxInvoiceRequestBody {
  @IsEnum(TaxType)
  @IsNotEmpty()
  @ApiProperty()
  taxType: TaxType;

  @IsEnum(OfficeType)
  @IsNotEmpty()
  @ApiProperty()
  officeType: OfficeType;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  taxEntityName: string;

  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  @ValidateIf(
    (object: TaxInvoiceRequestBody) => object.officeType === OfficeType.BRANCH,
  )
  headOfficeOrBranch?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  taxId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  taxAddress: string;

  @IsNumber()
  @ApiProperty()
  districtId: number;

  @IsNumber()
  @ApiProperty()
  subdistrictId: number;

  @IsNumber()
  @ApiProperty()
  provinceId: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  country: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  zipCode: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  contactPerson: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  contactPhoneNumber: string;

  @Matches(EMAIL_PATTERN)
  @IsNotEmpty()
  @ApiProperty()
  contactEmail: string;
}

export class BillingAddressRequestBody {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  contactPerson: string;

  @IsString()
  @Matches(TH_PHONE_REGEX)
  @IsNotEmpty()
  @ApiProperty()
  contactNumber: string;

  @Matches(EMAIL_PATTERN)
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  billingAddress: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  district: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  subDistrict: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  province: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  country: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  zipCode: string;
}
export class InitializePaymentRequestBody {
  @IsBoolean()
  @ApiProperty()
  issueTaxInvoice: boolean;

  @Matches(EMAIL_PATTERN)
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  redirectUrl: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  planId: string;

  @IsEnum(PAYMENT_OPTIONS)
  @IsNotEmpty()
  @ApiProperty()
  paymentOptions: PAYMENT_OPTIONS;

  @ApiProperty()
  @ValidateIf(
    (object: InitializePaymentRequestBody) => object.issueTaxInvoice === true,
  )
  @ValidateNested()
  @Type(() => TaxInvoiceRequestBody)
  taxInvoice?: TaxInvoiceRequestBody;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @ValidateIf(
    (object: InitializePaymentRequestBody) => object.issueTaxInvoice === true,
  )
  billingAddressId?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  couponCode?: string;
}

export class InitializePaymentResponseBody {
  paymentUrl: string;
}
