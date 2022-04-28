/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';
import { User } from '@seaccentral/core/dist/user/User.entity';

export class InvitationSignupRequestBody {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  token: string;

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
  recaptcha: string;
}

export class InvitationSignupResponse {
  accessToken: string;

  refreshToken: string;

  user: Partial<User>;

  accessTokenExpiry?: string;

  refreshTokenExpiry?: string;
}
