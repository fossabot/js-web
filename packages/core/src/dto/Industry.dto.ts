import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Industry } from '../user/Industry.entity';

export class IndustryDto extends Industry {
  @ApiProperty()
  nameEn: string;

  @ApiProperty()
  nameTh: string;

  @ApiPropertyOptional()
  description?: string;
}
