import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class TopicBody {
  @IsString()
  @Length(1, 50)
  @ApiProperty()
  name: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  @ApiProperty()
  parentId: string;
}
