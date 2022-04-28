/* eslint-disable max-classes-per-file */

import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class AREligibleSkuDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  Eligible_SKU_Code: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  Eligible_SKU_Name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  Coupon_Code: string;
}

export class AREligibleSkuRequest {
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => AREligibleSkuDto)
  @ApiProperty()
  records: AREligibleSkuDto[];
}
