import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsUUID } from 'class-validator';

export class CourseHasCertificateQuery {
  @IsUUID('4', { each: true })
  @IsArray()
  @ArrayMinSize(1)
  @ApiProperty()
  ids: string[];
}
