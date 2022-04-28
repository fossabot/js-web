import { IsNotEmpty, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginSettingDto {
  id?: string;

  @IsInt()
  @IsNotEmpty()
  @ApiProperty()
  maxAttempts: number;

  @IsInt()
  @IsNotEmpty()
  @Min(30)
  @Max(360)
  @ApiProperty()
  lockDuration: number;
}
