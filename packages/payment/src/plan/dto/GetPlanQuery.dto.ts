import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsIn, IsOptional, IsString } from 'class-validator';

import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import { InstancyPackageType } from '@seaccentral/core/dist/payment/SubscriptionPlan.entity';

export class GetPlanQuery extends BaseQueryDto {
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @ApiProperty({ required: false })
  linked?: boolean;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @ApiProperty({ required: false })
  unlinked?: boolean;

  @IsString()
  @IsOptional()
  @Type(() => String)
  @ApiProperty({ required: false })
  organizationId?: string;

  @IsEnum(InstancyPackageType)
  @IsOptional()
  @ApiProperty({ required: false })
  packageType: InstancyPackageType;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  @ApiProperty({ required: false })
  orderByDuration?: 'asc' | 'desc';

  @IsString()
  @IsOptional()
  @Type(() => String)
  @ApiProperty({ required: false })
  courseOutlineId?: string;
}
