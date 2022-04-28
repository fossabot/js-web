import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EMAIL_PATTERN } from '../utils/constants';

export class UserUploadRecordDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  lastName: string;

  @Matches(EMAIL_PATTERN)
  @IsNotEmpty()
  @ApiProperty()
  email: string;
}
