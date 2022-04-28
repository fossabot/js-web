/* eslint-disable max-classes-per-file */

import { ApiProperty } from '@nestjs/swagger';
import {
  CouponType,
  DiscountUOM,
  EligibleSkuType,
  PromoType,
} from '@seaccentral/core/dist/raw-product/CouponMasterArRaw.entity';
import { DEFAULT_TIMEZONE } from '@seaccentral/core/dist/utils/constants';
import { formatWithTimezone } from '@seaccentral/core/dist/utils/date';
import { Type, Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDate,
  IsDecimal,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { parse } from 'date-fns';
import ARStatusCode from './ARStatusCode.enum';

function ddmmyyyyToDate(value: string) {
  const date = parse(value, 'dd/MM/yyyy', new Date());
  const zone = formatWithTimezone(new Date(), DEFAULT_TIMEZONE, 'XXX');

  return new Date(date.toISOString().replace(/T.*/, `T00:00:00${zone}`));
}

export class ARCouponMasterDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  Coupon_Code: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  Coupon_Name: string;

  @IsEnum(PromoType)
  @ApiProperty()
  Promo_Type: PromoType;

  @IsEnum(CouponType)
  @ApiProperty()
  Coupon_Type: CouponType;

  @IsDecimal({ decimal_digits: '2' })
  @ApiProperty()
  Promotion: string;

  @IsEnum(DiscountUOM)
  @ApiProperty()
  Discount_UOM: DiscountUOM;

  @IsEnum(ARStatusCode)
  @ApiProperty()
  Status: ARStatusCode;

  @IsOptional()
  @IsDate()
  @ApiProperty()
  @Transform(({ value }) => ddmmyyyyToDate(value))
  Start_Date?: Date;

  @IsDate()
  @ApiProperty()
  @Transform(({ value }) => ddmmyyyyToDate(value))
  End_Date: Date;

  @IsNumber()
  @ApiProperty()
  Quota: number;

  @IsNumber()
  @ApiProperty()
  Redeem: number;

  @IsNumber()
  @ApiProperty()
  Remain: number;

  @IsDecimal({ decimal_digits: '2' })
  @ApiProperty()
  Campaign_Budget: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  Budget_UOM?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  Reference_Campaign_Name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  Usage_Condition?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  Product_Group: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  Sub_Product_Group: string;

  @IsEnum(EligibleSkuType)
  @ApiProperty()
  Eligible_SKU_Type: EligibleSkuType;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  Create_by: string;

  @IsDate()
  @IsOptional()
  @ApiProperty()
  @Transform(({ value }) => ddmmyyyyToDate(value))
  Update_Date?: Date;
}

export class ARCouponMasterRequest {
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => ARCouponMasterDto)
  @ApiProperty()
  records: ARCouponMasterDto[];
}
