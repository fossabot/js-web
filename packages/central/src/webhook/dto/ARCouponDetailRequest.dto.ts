/* eslint-disable max-classes-per-file */

import { ApiProperty } from '@nestjs/swagger';
import { DEFAULT_TIMEZONE } from '@seaccentral/core/dist/utils/constants';
import { formatWithTimezone } from '@seaccentral/core/dist/utils/date';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { parse } from 'date-fns';

function ddmmyyyyToDate(value: string) {
  const date = parse(value, 'dd/MM/yyyy', new Date());
  const zone = formatWithTimezone(new Date(), DEFAULT_TIMEZONE, 'XXX');

  return new Date(date.toISOString().replace(/T.*/, `T00:00:00${zone}`));
}

export class ARCouponDetailDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  Coupon_Code: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  Coupon_Unique_No: string;

  @IsDate()
  @ApiProperty()
  @Transform(({ value }) => ddmmyyyyToDate(value))
  System_Created_Date: Date;

  @IsBoolean()
  @ApiProperty()
  Used: boolean;
}

export class ARCouponDetailRequest {
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => ARCouponDetailDto)
  @ApiProperty()
  records: ARCouponDetailDto[];
}
