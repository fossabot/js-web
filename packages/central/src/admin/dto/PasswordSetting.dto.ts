import { IsNotEmpty, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PasswordSettingDto {
  id?: string;

  @IsInt()
  @IsNotEmpty()
  @ApiProperty()
  expireIn: number;

  @IsInt()
  @IsNotEmpty()
  @ApiProperty()
  notifyIn: number;
}
