/* eslint-disable max-classes-per-file */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

import { CourseLanguage } from '@seaccentral/core/dist/course/courseLanguage.enum';

class CourseSessionBody {
  @IsUUID('4')
  @IsOptional()
  @ApiPropertyOptional()
  id?: string;

  @IsUUID('4')
  @IsNotEmpty()
  @ApiProperty()
  courseOutlineId: string;

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

  @IsUUID('4')
  @IsNotEmpty()
  @ApiProperty()
  instructorId: string;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty()
  isPrivate: boolean;
}

export class CreateCourseSessionBody extends CourseSessionBody {}

export class UpdateCourseSessionBody extends CourseSessionBody {
  @IsUUID('4')
  @IsNotEmpty()
  @ApiProperty()
  id: string;
}
