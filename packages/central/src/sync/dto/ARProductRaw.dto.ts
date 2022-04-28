import { IsBoolean, IsDate, IsNumber, IsString, IsUUID } from 'class-validator';

export class ARProductRawDto {
  @IsUUID('4')
  id: string;

  @IsBoolean()
  isActive: boolean;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsString()
  productGroup: string;

  @IsString()
  subProductGroup: string;

  @IsString()
  partner: string;

  @IsString()
  deliveryFormat: string;

  @IsString()
  itemCategory: string;

  @IsString()
  no: string;

  @IsString()
  description: string;

  @IsNumber()
  periodYear: number;

  @IsNumber()
  periodMonth: number;

  @IsNumber()
  periodDay: number;

  @IsString()
  baseUnitOfMeasure: string;

  @IsString()
  unitPrice: string;

  @IsString()
  currency: string;

  @IsString()
  countryRegionOfOriginCode: string;

  @IsString()
  productAvailability: string;

  @IsString()
  shelfLife: string;

  @IsString()
  revenueType: string;

  @IsString()
  thirdPartyLicenseFee: string;
}
