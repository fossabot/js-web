/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';
import { User } from '../user/User.entity';
import { EMAIL_PATTERN } from '../utils/constants';

export class LocalSignupRequestBody {
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

  @MinLength(8)
  @IsString()
  @IsNotEmpty()
  @Matches(/[A-Z]/) // Uppercase
  @Matches(/[a-z]/) // Lowercase
  @Matches(/[0-9]/) // Number
  @Matches(/[!#$%&'()*+,-./:;<=>?@[\]^_{|}~]/) // Special Character
  @ApiProperty()
  password: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  leadformurl: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  recaptcha: string;
}
export class LocalSignupResponse {
  accessToken: string;

  refreshToken: string;

  user: Partial<User>;

  accessTokenExpiry?: string;

  refreshTokenExpiry?: string;
}
