/* eslint-disable max-classes-per-file */

import { ApiProperty } from '@nestjs/swagger';
import {
  ProductAvailability,
  RevenueType,
  ShelfLife,
  ThirdPartyLicenseFee,
} from '@seaccentral/core/dist/raw-product/ProductArRaw.entity';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDecimal,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

export class ARProductDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  Product_Group: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  Sub_Product_Group: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  Partner: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  Delivery_Format: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  Item_Category: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  No: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  Description: string;

  @IsNumber()
  @ApiProperty()
  Period_Year: number;

  @IsNumber()
  @ApiProperty()
  Period_Month: number;

  @IsNumber()
  @ApiProperty()
  Period_Day: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  Base_Unit_of_Measure: string;

  @IsDecimal({ decimal_digits: '2' })
  @ApiProperty()
  Unit_Price: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  Currency: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  Country_Region_of_Origin_Code: string;

  @IsEnum(ProductAvailability)
  @ApiProperty()
  Product_Availability: ProductAvailability;

  @IsEnum(ShelfLife)
  @ApiProperty()
  Shelf_Life: ShelfLife;

  @IsEnum(RevenueType)
  @ApiProperty()
  Revenue_Type: RevenueType;

  @IsEnum(ThirdPartyLicenseFee)
  @ApiProperty()
  Third_Party_License_Fee: ThirdPartyLicenseFee;
}

export class ARProductWrapperRequest {
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => ARProductDto)
  @ApiProperty()
  records: ARProductDto[];
}
