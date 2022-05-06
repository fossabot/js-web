import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class MemberDetailDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  SkuCode: string;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty()
  StartPackage: string;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty()
  EndPackage: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  SaleOrderID: string;

  @IsOptional()
  @IsUUID('4')
  @IsNotEmpty()
  @ApiPropertyOptional()
  OrganizationID?: string;

  @IsString()
  @ApiProperty()
  Company: string;

  @IsString()
  @ApiProperty()
  Department: string;

  @IsString()
  @ApiProperty()
  BatchName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  SEACID: string;

  @IsString()
  @ApiProperty()
  DealId: string;

  @IsString()
  @ApiProperty()
  InvoiceNumber: string;

  @IsString()
  @ApiProperty()
  AmendmentStatus: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  UserGroupID?: string;
}
