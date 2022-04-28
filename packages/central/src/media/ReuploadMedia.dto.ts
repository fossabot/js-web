import { IsIn, IsNotEmpty, IsPositive, IsString } from 'class-validator';
import mime from 'mime';

export class ReuploadMediaDto {
  @IsIn([mime.getType('mp4'), mime.getType('mov')])
  mime: string;

  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsPositive()
  bytes: number;
}
