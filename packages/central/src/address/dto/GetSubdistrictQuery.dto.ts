import { IsEnum, IsIn, IsInt, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { LOCALES } from './AddressLocale';

export class GetSubdistrictQueryDTO {
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @ApiProperty({ required: false })
  id?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @ApiProperty({ required: false })
  provinceId?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @ApiProperty({ required: false })
  districtId?: number;

  @IsOptional()
  @IsEnum(LOCALES)
  @IsIn([LOCALES.EN, LOCALES.TH])
  @ApiPropertyOptional()
  locale? = LOCALES.EN;
}
