import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsUUID } from 'class-validator';

export class LearningTrackHasCertificateQueryDto {
  @IsUUID('4', { each: true })
  @ArrayMinSize(1)
  @IsArray()
  @ApiProperty()
  ids: string[];
}
