/* eslint-disable max-classes-per-file */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  Validate,
  ValidateNested,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { LanguageBody } from '@seaccentral/core/dist/dto/Language.dto';
import { CourseStatus } from '@seaccentral/core/dist/course/courseStatus.enum';
import { Type } from 'class-transformer';

class SectionCourse {
  @IsUUID('4')
  @ApiProperty()
  id: string;

  @IsBoolean()
  @ApiProperty()
  isRequired: boolean;
}

class LearningTrackSectionBody {
  @IsUUID('4')
  @IsOptional()
  @ApiPropertyOptional()
  id?: string;

  @IsObject()
  @IsNotEmpty()
  @ApiProperty()
  title: LanguageBody;

  @IsNumber()
  @Min(1)
  @ApiProperty()
  part: number;

  @IsArray()
  @ApiProperty()
  @ArrayMinSize(1)
  @Type(() => SectionCourse)
  @ValidateNested({ each: true })
  courses: SectionCourse[];
}

@ValidatorConstraint({ name: 'requiredCourse', async: false })
class LearningTrackShouldHaveAtLeastOneRequiredCourse
  implements ValidatorConstraintInterface
{
  validate(data: LearningTrackSectionBody[]) {
    return (
      data.length > 0 &&
      data.filter((d) => d.courses.some((c) => c.isRequired)).length > 0
    );
  }

  defaultMessage() {
    return 'Learning track should have at least 1 required course';
  }
}

class LearningTrackBody {
  @IsUUID('4')
  @IsOptional()
  @ApiPropertyOptional()
  id?: string;

  @IsObject()
  @IsNotEmpty()
  @ApiProperty()
  title: LanguageBody;

  @IsObject()
  @IsOptional()
  @ApiPropertyOptional()
  tagLine?: LanguageBody | null;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  imageKey?: string | null;

  @IsNumber()
  @ApiProperty()
  durationMinutes: number;

  @IsNumber()
  @ApiProperty()
  durationHours: number;

  @IsNumber()
  @ApiProperty()
  durationDays: number;

  @IsNumber()
  @ApiProperty()
  durationWeeks: number;

  @IsNumber()
  @ApiProperty()
  durationMonths: number;

  @IsObject()
  @IsOptional()
  @ApiPropertyOptional()
  description?: LanguageBody | null;

  @IsObject()
  @IsOptional()
  @ApiPropertyOptional()
  learningObjective?: LanguageBody | null;

  @IsObject()
  @IsOptional()
  @ApiPropertyOptional()
  learningTrackTarget?: LanguageBody | null;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty()
  isPublic: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty()
  isFeatured: boolean;

  @IsEnum(CourseStatus)
  @IsNotEmpty()
  @ApiProperty()
  status: CourseStatus;

  @IsUUID('4')
  @IsNotEmpty()
  @ApiProperty()
  categoryId: string;

  @IsArray()
  @IsNotEmpty()
  @ApiProperty()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => LearningTrackSectionBody)
  @Validate(LearningTrackShouldHaveAtLeastOneRequiredCourse)
  learningTrackSections: LearningTrackSectionBody[];

  @IsUUID('4', { each: true })
  @IsArray()
  @ApiProperty()
  tagIds: string[];

  @IsUUID('4', { each: true })
  @IsArray()
  @ApiProperty()
  materialIds: string[];

  @IsUUID('4', { each: true })
  @ArrayMinSize(1)
  @IsArray()
  @ApiProperty()
  topicIds: string[];
}

export class CreateLearningTrackBody extends LearningTrackBody {}

export class UpdateLearningTrackBody extends LearningTrackBody {
  @IsUUID('4')
  @IsNotEmpty()
  @ApiProperty()
  id: string;
}
