import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpsertBillingAddressDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
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

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  constructor(partial: Partial<UpsertBillingAddressDto>) {
    Object.assign(this, partial);
  }
}
