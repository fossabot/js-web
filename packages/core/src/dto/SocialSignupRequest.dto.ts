import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SocialSignupRequest {
  @IsString()
  @IsNotEmpty()
  firstName?: string;

  @IsString()
  @IsNotEmpty()
  lastName?: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}
