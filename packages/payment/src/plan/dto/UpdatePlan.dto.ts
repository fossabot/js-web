import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsDecimal,
  IsArray,
  IsUUID,
} from 'class-validator';

import {
  ExternalPackageProviderType,
  SubscriptionPlanCategory,
  InstancyPackageType,
} from '@seaccentral/core/dist/payment/SubscriptionPlan.entity';

export class UpdatePlan {
  @IsDecimal()
  @IsNotEmpty()
  @ApiProperty()
  vatRate: string;

  @IsEnum(SubscriptionPlanCategory)
  @IsNotEmpty()
  @ApiProperty()
  category: SubscriptionPlanCategory;

  @IsEnum(ExternalPackageProviderType)
  @IsOptional()
  @ApiPropertyOptional()
  externalProviderType?: ExternalPackageProviderType | null;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty()
  isPublic: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty()
  isActive: boolean;

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
  packageType?: InstancyPackageType | null;

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

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  @ApiPropertyOptional()
  courseBundleIds?: string[];
}
