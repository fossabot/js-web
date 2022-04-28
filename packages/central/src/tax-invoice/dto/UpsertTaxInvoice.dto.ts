/* eslint-disable max-classes-per-file */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  OfficeType,
  TaxType,
} from '@seaccentral/core/dist/payment/TaxInvoice.entity';
import { EMAIL_PATTERN } from '@seaccentral/core/dist/utils/constants';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

class UpsertBillingAddressDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiPropertyOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  billingAddress: string;

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
  @ApiProperty()
  country: string;
}

export class UpsertTaxInvoiceDto {
  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional()
  id?: string;

  @IsBoolean()
  @ApiProperty()
  isDefault: boolean;

  @IsEnum(TaxType)
  @IsNotEmpty()
  @ApiProperty({ enum: TaxType })
  taxType: TaxType;

  @IsEnum(OfficeType)
  @IsNotEmpty()
  @ApiProperty({ enum: OfficeType })
  officeType: OfficeType;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  taxEntityName: string;

  @IsString()
  @ApiPropertyOptional()
  @IsNotEmpty()
  @ValidateIf(
    (object: UpsertTaxInvoiceDto) => object.officeType === OfficeType.BRANCH,
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

  @IsOptional()
  @ValidateNested()
  @Type(() => UpsertBillingAddressDto)
  billingAddress?: UpsertBillingAddressDto;
}
