import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';

import { LearningTrackDirectAccessorType } from '@seaccentral/core/dist/learning-track/LearningTrackDirectAccess.entity';

export class LearningTrackDirectAccessBody {
  @IsUUID('4')
  @IsNotEmpty()
  @ApiProperty()
  accessorId: string;

  @IsUUID('4')
  @IsNotEmpty()
  @ApiProperty()
  learningTrackId: string;

  @IsNotEmpty()
  @IsDateString()
  @ApiProperty()
  expiryDateTime: string;

  @IsEnum(LearningTrackDirectAccessorType)
  @IsIn([
    LearningTrackDirectAccessorType.User,
    LearningTrackDirectAccessorType.Group,
    LearningTrackDirectAccessorType.Organization,
  ])
  @ApiProperty()
  accessorType: LearningTrackDirectAccessorType;
}
