import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import mime from 'mime';

export class SaveSystemAnnouncementImagesDto {
  @IsIn([mime.getType('png'), mime.getType('jpeg'), mime.getType('jpg')])
  @ApiProperty()
  mime: string;
}
