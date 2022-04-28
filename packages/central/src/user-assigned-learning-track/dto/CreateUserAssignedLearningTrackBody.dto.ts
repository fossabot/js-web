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
import { UserAssignedLearningTrackType } from '@seaccentral/core/dist/learning-track/UserAssignedLearningTrack.entity';

export class CreateUserAssignedLearningTrackBody {
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
  learningTrackId: string;

  @IsOptional()
  @IsNullable()
  @IsDateString()
  @ApiPropertyOptional()
  dueDateTime?: string | null;

  @IsEnum(UserAssignedLearningTrackType)
  @IsNotEmpty()
  @ApiProperty()
  assignmentType: UserAssignedLearningTrackType =
    UserAssignedLearningTrackType.Optional;
}
