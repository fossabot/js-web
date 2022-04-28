import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import { UserEnrolledLearningTrackStatus } from '@seaccentral/core/dist/learning-track/UserEnrolledLearningTrackStatus.enum';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class GetAllEnrolledLearningTracksQueryDto extends BaseQueryDto {
  @IsUUID('4')
  @IsOptional()
  @ApiPropertyOptional()
  topicId?: string;

  @IsUUID('4')
  @IsOptional()
  @ApiPropertyOptional()
  learningWayId?: string;

  @IsEnum(UserEnrolledLearningTrackStatus)
  @IsOptional()
  @ApiPropertyOptional()
  status?: UserEnrolledLearningTrackStatus;
}
