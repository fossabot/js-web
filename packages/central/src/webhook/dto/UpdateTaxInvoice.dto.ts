import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  OfficeType,
  TaxType,
} from '@seaccentral/core/dist/payment/TaxInvoice.entity';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateTaxInvoiceDto {
  @IsOptional()
  @IsEnum(TaxType)
  @ApiPropertyOptional({ enum: TaxType })
  taxType?: TaxType;

  @IsOptional()
  @IsEnum(OfficeType)
  @ApiPropertyOptional({ enum: OfficeType })
  officeType?: OfficeType;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional()
  taxEntityName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional()
  headOfficeOrBranch?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional()
  taxId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional()
  taxAddress?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional()
  country?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional()
  provinceCode?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional()
  districtCode?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional()
  subdistrictCode?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional()
  postalCode?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional()
  contactPerson?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional()
  contactPhoneNumber?: string;

  @IsOptional()
  @IsEmail()
  @IsNotEmpty()
  @ApiPropertyOptional()
  contactEmail?: string;
}
