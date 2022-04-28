import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import ARStatusCode from './ARStatusCode.enum';

export class ARSKURequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  SKUCode: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  SKUName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  SKUPricing: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  ProductAvailability: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  EligibleCountry?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  SubProductGroupName?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  SKUGroupName?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  CurrencyName?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  UOMName?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  PartnerName?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  UnitperSKU?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  DeliveryFormat?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  RevenueType?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  ThirdPartyLicenseFee?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  ShelfLife?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  StandardCost?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  PackageDay?: string;

  @IsOptional()
  @IsEnum(ARStatusCode)
  @ApiPropertyOptional()
  StatusCode?: ARStatusCode;
}
