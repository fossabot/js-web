import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsNullable } from '@seaccentral/core/dist/utils/custom-validator';
import { UserAssignedLearningTrackType } from '@seaccentral/core/dist/learning-track/UserAssignedLearningTrack.entity';

export class UpdateUserAssignedLearningTrackBody {
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
  @ApiProperty()
  assignmentType: UserAssignedLearningTrackType =
    UserAssignedLearningTrackType.Optional;
}
