import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBooleanString, IsEnum, IsOptional, IsString } from 'class-validator';

import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import { UserAssignedLearningTrackType } from '@seaccentral/core/dist/learning-track/UserAssignedLearningTrack.entity';

export enum LearningTrackSearchCategory {
  BLENDED = 'BLENDED',
  ONLINE_ONLY = 'ONLINE_ONLY',
}

export class LearningTrackSearchQueryDto extends BaseQueryDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  topicId?: string;

  @IsEnum(LearningTrackSearchCategory)
  @IsOptional()
  @ApiPropertyOptional({ enum: LearningTrackSearchCategory, nullable: true })
  category?: LearningTrackSearchCategory = LearningTrackSearchCategory.BLENDED;

  @IsBooleanString()
  @IsOptional()
  @ApiPropertyOptional()
  hasCertificate?: boolean;

  @IsEnum(UserAssignedLearningTrackType)
  @IsOptional()
  @ApiPropertyOptional()
  assignmentType?: UserAssignedLearningTrackType;
}
