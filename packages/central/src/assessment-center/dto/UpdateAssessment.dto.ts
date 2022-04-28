import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, ValidateIf } from 'class-validator';
import {
  AssessmentStatus,
  CreateAssessmentResponseBody,
  PasswordStatus,
  ResultStatus,
} from '../interface/IassessmentCenter';

export class UpdateAssessmentDto implements CreateAssessmentResponseBody {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  assessmentid: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  assessment_name: string;

  @IsString()
  @ApiProperty()
  assessment_link: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  userid: string;

  @IsEnum(PasswordStatus)
  @ApiProperty({ enum: PasswordStatus })
  password_status: PasswordStatus;

  @IsEnum(ResultStatus)
  @ApiProperty({ enum: ResultStatus })
  result_status: ResultStatus;

  @IsEnum(AssessmentStatus)
  @ApiProperty({ enum: AssessmentStatus })
  status: AssessmentStatus;

  @IsString()
  @IsNotEmpty()
  @ValidateIf((obj, value) => value !== null)
  @ApiProperty()
  reporturl: string | null;

  @IsString()
  @IsNotEmpty()
  @ValidateIf((obj, value) => value !== null)
  @ApiProperty()
  answeringStart: string | null;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  createdDate: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  updatedDate: string;
}
