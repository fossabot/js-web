import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateSystemAnnouncementStatusDto {
  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty()
  isActive: boolean;
}
