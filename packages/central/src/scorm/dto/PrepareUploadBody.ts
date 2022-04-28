import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class PrepareUploadBody {
  @IsString({ each: true })
  @IsArray()
  @ApiProperty()
  keys: string[];
}
