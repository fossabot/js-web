import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import mime from 'mime';

export class CreateMediaDto {
  @IsIn([mime.getType('mp4'), mime.getType('mov')])
  mime: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsPositive()
  bytes: number;
}
