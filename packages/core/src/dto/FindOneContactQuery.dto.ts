import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class FindOneContactQuery {
  @IsUUID('4')
  @IsNotEmpty()
  @ApiProperty()
  id: string;
}
