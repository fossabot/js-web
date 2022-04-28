import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches } from 'class-validator';
import { EMAIL_PATTERN } from '@seaccentral/core/dist/utils/constants';

export class ForgotPasswordDto {
  @Matches(EMAIL_PATTERN)
  @IsNotEmpty()
  @ApiProperty()
  email: string;
}
