import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsNullable } from '@seaccentral/core/dist/utils/custom-validator';
import { UserAssignedCourseType } from '@seaccentral/core/dist/course/UserAssignedCourse.entity';

export class UpdateUserAssignedCourseBody {
  @IsUUID(4)
  @IsNotEmpty()
  @ApiProperty()
  courseId: string;

  @IsOptional()
  @IsNullable()
  @IsDateString()
  @ApiPropertyOptional()
  dueDateTime?: string | null;

  @IsEnum(UserAssignedCourseType)
  @ApiProperty()
  assignmentType: UserAssignedCourseType = UserAssignedCourseType.Optional;
}
