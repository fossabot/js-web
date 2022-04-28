import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsNullable } from '@seaccentral/core/dist/utils/custom-validator';
import { UserAssignedCourseType } from '@seaccentral/core/dist/course/UserAssignedCourse.entity';

export class CreateUserAssignedCourseBody {
  @IsUUID(4, { each: true })
  @IsArray()
  @IsOptional()
  @ApiPropertyOptional()
  userIds?: string[];

  @IsUUID(4, { each: true })
  @IsArray()
  @IsOptional()
  @ApiPropertyOptional()
  groupIds?: string[];

  @IsUUID(4, { each: true })
  @IsArray()
  @IsOptional()
  @ApiPropertyOptional()
  organizationIds?: string[];

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
  @IsNotEmpty()
  @ApiProperty()
  assignmentType: UserAssignedCourseType = UserAssignedCourseType.Optional;
}
