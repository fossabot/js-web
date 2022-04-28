import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import { UserAssignedCourseType } from '@seaccentral/core/dist/course/UserAssignedCourse.entity';

export enum LearningStatus {
  NOT_STARTED = 'notStarted',
  IN_PROGRESS = 'inProgress',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

export class GetAllEnrolledCoursesQueryDto extends BaseQueryDto {
  @IsUUID('4')
  @IsOptional()
  @ApiPropertyOptional()
  topicId?: string;

  @IsUUID('4')
  @IsOptional()
  @ApiPropertyOptional()
  learningWayId?: string;

  @IsEnum(LearningStatus)
  @IsOptional()
  @ApiPropertyOptional()
  status?: LearningStatus;

  @IsEnum(UserAssignedCourseType)
  @IsOptional()
  @ApiPropertyOptional()
  assignmentType?: UserAssignedCourseType;
}
