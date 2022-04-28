import { IsEnum, IsIn, IsInt, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { LOCALES } from './AddressLocale';

export class GetProvinceQueryDTO {
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional()
  id: number;

  @IsOptional()
  @IsEnum(LOCALES)
  @IsIn([LOCALES.EN, LOCALES.TH])
  @ApiPropertyOptional()
  locale? = LOCALES.EN;
}
