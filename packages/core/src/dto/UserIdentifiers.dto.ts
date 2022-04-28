import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsUUID } from 'class-validator';

export class UserIdentifiers {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  @ApiProperty()
  ids: string[];
}
