import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateEmailNotificationStatusDto {
  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty()
  isActive!: boolean;
}
