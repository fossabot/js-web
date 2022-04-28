import { ApiPropertyOptional } from '@nestjs/swagger';
import { dateToUTCDate } from '@seaccentral/core/dist/utils/date';
import { CourseSubCategoryKey } from '@seaccentral/core/dist/course/CourseSubCategory.entity';
import { CourseSessionStatus } from '@seaccentral/core/dist/course/CourseSessionStatus.enum';
import {
  IsDateString,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CourseSessionManagementQueryDto {
  @IsDateString()
  @ApiPropertyOptional()
  @IsOptional()
  startTime: string = dateToUTCDate(new Date()).toISOString();

  @IsDateString()
  @ApiPropertyOptional()
  @IsOptional()
  endTime?: string;

  @IsOptional()
  @IsUUID('4', { each: true })
  @ApiPropertyOptional({ type: [String] })
  instructorIds?: string[] | string;

  @IsOptional()
  @ApiPropertyOptional()
  search?: string;

  @IsOptional()
  @ApiPropertyOptional()
  page = 1;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional()
  perPage = 20;

  @IsOptional()
  @ApiPropertyOptional()
  @IsEnum(CourseSubCategoryKey)
  @IsIn([CourseSubCategoryKey.FACE_TO_FACE, CourseSubCategoryKey.VIRTUAL])
  type?: CourseSubCategoryKey;

  @IsOptional()
  @ApiPropertyOptional()
  @IsEnum(CourseSessionStatus)
  status?: CourseSessionStatus;
}
