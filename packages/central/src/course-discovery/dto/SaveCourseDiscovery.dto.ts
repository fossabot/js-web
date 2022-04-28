import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class SaveCourseDiscoveryDto {
  @IsUUID('4', { each: true })
  @IsArray()
  @ApiProperty({ format: 'uuid' })
  'highlights': string[];

  @IsUUID('4', { each: true })
  @IsArray()
  @ApiProperty({ format: 'uuid' })
  'popular': string[];

  @IsUUID('4', { each: true })
  @IsArray()
  @ApiProperty({ format: 'uuid' })
  'newReleases': string[];
}
