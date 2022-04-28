/* eslint-disable max-classes-per-file */

import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { CourseRuleType } from '@seaccentral/core/dist/course/CourseRuleItem.entity';

class CourseRuleItemBody {
  @IsUUID('4')
  @IsOptional()
  @ApiPropertyOptional()
  id?: string;

  @IsEnum(CourseRuleType)
  @IsNotEmpty()
  @ApiProperty()
  type: CourseRuleType;

  @IsUUID('4')
  @IsNotEmpty()
  @ApiProperty()
  appliedForId: string;

  @IsUUID('4')
  @IsNotEmpty()
  @ApiProperty()
  appliedById: string;
}

class CourseRuleBody {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsArray()
  @IsNotEmpty()
  @ApiProperty()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  courseRuleItems: CourseRuleItemBody[];
}

export class CreateCourseRuleBody extends CourseRuleBody {}

export class UpdateCourseRuleBody extends CourseRuleBody {
  @IsUUID('4')
  @IsNotEmpty()
  @ApiProperty()
  id: string;
}

export class GetCourseRuleByCourseOutlineQueryDto {
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMinSize(1)
  @ApiProperty()
  ids: string[];

  @IsArray()
  @IsEnum(CourseRuleType, { each: true })
  @ArrayMinSize(1)
  @ApiProperty()
  types: CourseRuleType[];
}
