/* eslint-disable max-classes-per-file */

import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  IsEnum,
  ArrayMinSize,
  ValidateIf,
  Min,
  Max,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { CertificationType } from '@seaccentral/core/dist/certificate/certificate.enum';

class CertificateUnlockCourseRuleItemBody {
  @IsUUID('4')
  @IsOptional()
  @ApiPropertyOptional()
  id?: string;

  @IsUUID('4')
  @IsNotEmpty()
  @ApiProperty()
  courseId: string;

  @Max(100)
  @Min(1)
  @IsInt()
  @IsNotEmpty()
  @ApiProperty()
  percentage: number;
}

class CertificateUnlockLearningTrackRuleItemBody {
  @IsUUID('4')
  @IsOptional()
  @ApiPropertyOptional()
  id?: string;

  @IsUUID('4')
  @IsNotEmpty()
  @ApiProperty()
  learningTrackId: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  percentage: number;
}

export class CertificateUnlockRuleBody {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  ruleName: string;

  @IsUUID('4')
  @IsNotEmpty()
  @ApiProperty()
  certificateId: string;

  @IsEnum(CertificationType)
  @IsNotEmpty()
  @ApiPropertyOptional({ enum: CertificationType, nullable: false })
  unlockType: CertificationType;

  @IsArray()
  @IsNotEmpty()
  @ApiProperty()
  @ArrayMinSize(1)
  @ValidateIf(
    (object: CertificateUnlockRuleBody) =>
      object.unlockType === CertificationType.COURSE,
  )
  @ValidateNested({ each: true })
  unlockCourseRuleItems: CertificateUnlockCourseRuleItemBody[];

  @IsArray()
  @IsNotEmpty()
  @ApiProperty()
  @ArrayMinSize(1)
  @ValidateIf(
    (object: CertificateUnlockRuleBody) =>
      object.unlockType === CertificationType.LEARNING_TRACK,
  )
  @ValidateNested({ each: true })
  unlockLearningTrackRuleItems: CertificateUnlockLearningTrackRuleItemBody[];
}

export class CreateCertificateUnlockRuleBody extends CertificateUnlockRuleBody {}

export class UpdateCertificateUnlockRuleBody extends CertificateUnlockRuleBody {
  @IsUUID('4')
  @IsNotEmpty()
  @ApiProperty()
  id: string;
}
