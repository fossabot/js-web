import {
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import { CourseLanguage } from '@seaccentral/core/dist/course/courseLanguage.enum';
import { UserAssignedCourseType } from '@seaccentral/core/dist/course/UserAssignedCourse.entity';
import { UserAssignedLearningTrackType } from '@seaccentral/core/dist/learning-track/UserAssignedLearningTrack.entity';

export class SearchQueryDto extends BaseQueryDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  type: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  term: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  courseCategory: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  lineOfLearning: string;

  @IsNumberString()
  @IsOptional()
  @ApiProperty()
  durationStart: number;

  @IsNumberString()
  @IsOptional()
  @ApiProperty()
  durationEnd: number;

  @IsNumberString()
  @IsOptional()
  @ApiProperty()
  hasCertificate: string;

  @IsNumberString()
  @IsOptional()
  @ApiProperty()
  myCourse: string;

  @IsNumberString()
  @IsOptional()
  @ApiProperty()
  myLearningTrack: string;

  @IsEnum(CourseLanguage)
  @ApiProperty()
  language: CourseLanguage = CourseLanguage.ALL;

  @IsEnum(UserAssignedCourseType)
  @IsOptional()
  @ApiPropertyOptional()
  assignmentType?: UserAssignedCourseType;

  @IsEnum(UserAssignedCourseType)
  @IsOptional()
  @ApiPropertyOptional()
  learningTrackAssignmentType?: UserAssignedLearningTrackType;
}
