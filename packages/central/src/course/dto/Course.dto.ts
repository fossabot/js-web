/* eslint-disable max-classes-per-file */

import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { CourseLanguage } from '@seaccentral/core/dist/course/courseLanguage.enum';
import { CourseStatus } from '@seaccentral/core/dist/course/courseStatus.enum';
import { LanguageBody } from '@seaccentral/core/dist/dto/Language.dto';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

class CourseSessionBody {
  @IsUUID('4')
  @IsOptional()
  @ApiPropertyOptional()
  id?: string;

  @IsPositive()
  @IsNotEmpty()
  @ApiProperty()
  seats: number;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  webinarTool?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  location?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  participantUrl?: string;

  @IsEnum(CourseLanguage)
  @IsOptional()
  @ApiPropertyOptional()
  language: CourseLanguage;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty()
  startDateTime: string;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty()
  endDateTime: string;

  @IsUUID('4', { each: true })
  @IsArray()
  @ApiProperty()
  @ArrayMinSize(1)
  instructorsIds: string[];

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty()
  isPrivate: boolean;
}

class CourseOutlineBody {
  @IsUUID('4')
  @IsOptional()
  @ApiPropertyOptional()
  id?: string;

  @IsObject()
  @IsOptional()
  @ApiPropertyOptional()
  @Type(() => LanguageBody)
  title?: LanguageBody | null;

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

  @IsUUID('4')
  @IsNotEmpty()
  @ApiProperty()
  categoryId: string;

  @IsUUID('4')
  @IsNotEmpty()
  @ApiProperty()
  learningWayId: string;

  @IsObject()
  @IsOptional()
  @ApiPropertyOptional()
  @Type(() => LanguageBody)
  description?: LanguageBody | null;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  providerName?: string | null;

  @ValidateIf(
    ({ value }) => value !== null && value !== undefined && value !== '',
  )
  @IsUUID('4')
  @ApiPropertyOptional()
  organizationId?: string | null;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  thirdPartyPlatformUrl?: string | null;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  thirdPartyCourseCode?: string | null;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  outlineType?: string | null;

  @IsUUID('4')
  @IsOptional()
  @ApiPropertyOptional()
  learningContentFileId?: string | null;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  learningContentFileKey?: string | null;

  @IsString()
  @ApiProperty()
  courseCode: string;

  @IsArray()
  @IsNotEmpty()
  @ApiProperty()
  @ValidateNested({ each: true })
  @Type(() => CourseSessionBody)
  courseSessions: CourseSessionBody[];

  @IsUUID('4', { each: true })
  @IsNotEmpty({ each: true })
  @ApiProperty()
  mediaPlaylist: string[];
}

class CourseBody {
  @IsUUID('4')
  @IsOptional()
  @ApiPropertyOptional()
  id?: string;

  @IsObject()
  @IsNotEmpty()
  @ApiProperty()
  @Type(() => LanguageBody)
  title: LanguageBody;

  @IsObject()
  @IsOptional()
  @ApiPropertyOptional()
  @Type(() => LanguageBody)
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

  @IsUUID('4')
  @IsNotEmpty()
  @ApiProperty()
  categoryId: string;

  @IsEnum(CourseLanguage)
  @IsNotEmpty()
  @ApiProperty()
  availableLanguage: CourseLanguage;

  @IsObject()
  @IsOptional()
  @ApiPropertyOptional()
  @Type(() => LanguageBody)
  description?: LanguageBody | null;

  @IsObject()
  @IsOptional()
  @ApiPropertyOptional()
  @Type(() => LanguageBody)
  learningObjective?: LanguageBody | null;

  @IsObject()
  @IsOptional()
  @ApiPropertyOptional()
  @Type(() => LanguageBody)
  courseTarget?: LanguageBody | null;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty()
  isPublic: boolean;

  @IsEnum(CourseStatus)
  @IsNotEmpty()
  @ApiProperty()
  status: CourseStatus;

  @IsArray()
  @IsNotEmpty()
  @ApiProperty()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CourseOutlineBody)
  courseOutlines: CourseOutlineBody[];

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

export class CreateCourseBody extends CourseBody {}

export class UpdateCourseBody extends CourseBody {
  @IsUUID('4')
  @IsNotEmpty()
  @ApiProperty()
  id: string;
}

export class CreateCourseOutlineBody extends CourseOutlineBody {}

export class UpdateCourseOutlineBody extends OmitType(CourseOutlineBody, [
  'courseSessions',
  'mediaPlaylist',
]) {}

export class CreateCourseSessionBody extends CourseSessionBody {}

export class UpdateCourseSessionBody extends CourseSessionBody {
  @IsUUID('4')
  @IsNotEmpty()
  @ApiProperty()
  id: string;
}
