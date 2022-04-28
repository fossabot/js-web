import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class SaveCatalogMenuDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  topicHeadlineEn: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  topicHeadlineTh: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  learningWayHeadlineEn: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  learningWayHeadlineTh: string;

  @IsUUID('4', { each: true })
  @IsArray()
  @ApiProperty({ format: 'uuid' })
  topics: string[];

  @IsUUID('4', { each: true })
  @IsArray()
  @ApiProperty({ format: 'uuid' })
  learningWays: string[];
}
