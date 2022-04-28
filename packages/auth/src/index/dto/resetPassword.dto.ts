import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
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
  token: string;
}
