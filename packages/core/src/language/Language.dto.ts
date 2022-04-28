import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Language } from './Language.entity';

export class LanguageDto extends Language {
  @ApiProperty()
  nameEn: string;

  @ApiPropertyOptional()
  nameTh?: string;
}
