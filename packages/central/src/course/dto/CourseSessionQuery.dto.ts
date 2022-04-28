import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CourseLanguage } from '@seaccentral/core/dist/course/courseLanguage.enum';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CourseSessionQueryDto {
  @IsDateString()
  @IsNotEmpty()
  @ApiProperty()
  startTime: string;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty()
  endTime: string;

  @IsUUID('4')
  @IsNotEmpty()
  @IsOptional()
  @ApiPropertyOptional()
  courseOutlineId?: string;

  @IsUUID('4', { each: true })
  @IsNotEmpty({ each: true })
  @IsOptional()
  @ApiPropertyOptional()
  instructorIds?: string[];

  @IsEnum(CourseLanguage)
  @IsNotEmpty()
  @IsOptional()
  @ApiPropertyOptional()
  language?: CourseLanguage = CourseLanguage.ALL;
}
