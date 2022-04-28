import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { EMAIL_PATTERN } from '@seaccentral/core/dist/utils/constants';

export class LoginDto {
  @Matches(EMAIL_PATTERN)
  @IsNotEmpty()
  @ApiProperty({ default: 'admin@seasiacenter.com' })
  email: string;

  @IsNotEmpty()
  @ApiProperty({ format: 'password', default: 'P@ssw0rd' })
  password: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  recaptcha: string;
}
