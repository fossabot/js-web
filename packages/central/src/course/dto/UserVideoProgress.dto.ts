import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class UserVideoProgressDto {
  @IsUUID('4')
  @IsNotEmpty()
  @ApiProperty()
  mediaId: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  spentDuration: number;
}
