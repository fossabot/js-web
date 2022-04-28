import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdatePushNotificationStatusDto {
  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty()
  isActive: boolean;
}
