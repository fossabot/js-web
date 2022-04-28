import { IsEnum, IsIn, IsInt, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { LOCALES } from './AddressLocale';

export class GetZipcodeQueryDTO {
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @ApiProperty()
  id: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @ApiProperty()
  provinceId: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @ApiProperty()
  districtId: number;

  @IsOptional()
  @IsEnum(LOCALES)
  @IsIn([LOCALES.EN, LOCALES.TH])
  @ApiPropertyOptional()
  locale? = LOCALES.EN;
}
