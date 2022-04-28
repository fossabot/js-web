import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsDecimal,
  IsObject,
  IsNumber,
} from 'class-validator';

import {
  IPlanFeatures,
  DurationInterval,
  ExternalPackageProviderType,
  SubscriptionPlanCategory,
  InstancyPackageType,
} from '@seaccentral/core/dist/payment/SubscriptionPlan.entity';

interface IExternalProvider {
  id: string;
}

export class CreatePlan {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  productId: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  detail?: string;

  @IsDecimal()
  @IsNotEmpty()
  @ApiProperty()
  price: string;

  @IsDecimal()
  @IsOptional()
  @ApiProperty()
  vatRate?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  currency: string;

  @IsEnum(SubscriptionPlanCategory)
  @IsNotEmpty()
  @ApiProperty()
  category: SubscriptionPlanCategory;

  @IsEnum(ExternalPackageProviderType)
  @IsOptional()
  @ApiPropertyOptional()
  externalProviderType?: ExternalPackageProviderType;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  externalProvider?: IExternalProvider;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  durationValue?: number;

  @IsEnum(DurationInterval)
  @IsOptional()
  @ApiPropertyOptional()
  durationInterval?: DurationInterval;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty()
  isPublic: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional()
  allowRenew?: boolean;

  @IsObject()
  @IsOptional()
  @ApiPropertyOptional()
  features?: IPlanFeatures;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  siteUrl?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  siteId?: string;

  @IsEnum(InstancyPackageType)
  @IsOptional()
  @ApiPropertyOptional()
  packageType?: InstancyPackageType;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  memberType?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  durationName?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  membershipId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  membershipDurationId?: string;
}
