import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ValidateDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  usernameOrEmail: string;
}
