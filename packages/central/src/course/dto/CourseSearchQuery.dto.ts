import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBooleanString,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import { CourseLanguage } from '@seaccentral/core/dist/course/courseLanguage.enum';
import { UserAssignedCourseType } from '@seaccentral/core/dist/course/UserAssignedCourse.entity';

export class CourseSearchQueryDto extends BaseQueryDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  id: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  type: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  categoryKey: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  subCategoryKey: string;

  @IsNumberString()
  @IsOptional()
  @ApiProperty()
  durationStart: number;

  @IsNumberString()
  @IsOptional()
  @ApiProperty()
  durationEnd: number;

  @IsBooleanString()
  @IsOptional()
  @ApiPropertyOptional()
  hasCertificate?: boolean;

  @IsEnum(CourseLanguage)
  @ApiProperty()
  language: CourseLanguage = CourseLanguage.ALL;

  @IsEnum(UserAssignedCourseType)
  @IsOptional()
  @ApiPropertyOptional()
  assignmentType?: UserAssignedCourseType;
}
