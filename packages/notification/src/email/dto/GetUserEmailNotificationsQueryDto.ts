import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import { IsEnum, IsOptional } from 'class-validator';

export enum GetUserEmailNotificationsRange {
  TODAY = 'today',
  LAST_WEEK = 'week',
  LAST_MONTH = 'month',
  ALL = 'all',
}

export class GetUserEmailNotificationsQueryDto extends BaseQueryDto {
  @IsEnum(GetUserEmailNotificationsRange)
  @IsOptional()
  @ApiPropertyOptional()
  range?: GetUserEmailNotificationsRange = GetUserEmailNotificationsRange.TODAY;
}
