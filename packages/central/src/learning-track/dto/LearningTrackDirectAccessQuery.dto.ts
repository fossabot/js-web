import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import { LearningTrackDirectAccessorType } from '@seaccentral/core/dist/learning-track/LearningTrackDirectAccess.entity';
import { IsEnum, IsIn, IsOptional } from 'class-validator';

export class LearningTrackDirectAccessQueryDto extends BaseQueryDto {
  @IsEnum(LearningTrackDirectAccessorType)
  @IsOptional()
  @IsIn([
    LearningTrackDirectAccessorType.User,
    LearningTrackDirectAccessorType.Group,
    LearningTrackDirectAccessorType.Organization,
  ])
  @ApiPropertyOptional()
  accessorType?: LearningTrackDirectAccessorType =
    LearningTrackDirectAccessorType.User;
}
