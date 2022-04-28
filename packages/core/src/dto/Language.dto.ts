import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class LanguageBody {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  nameEn?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  nameTh?: string | undefined;
}
