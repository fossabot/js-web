import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import ARStatusCode from './ARStatusCode.enum';

export class ARCurrencyRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  CurrencyCode: string;

  @IsString()
  @ApiProperty()
  CountryName: string;

  @IsString()
  @ApiProperty()
  CurrencyName: string;

  @IsOptional()
  @IsEnum(ARStatusCode)
  @ApiPropertyOptional()
  StatusCode?: ARStatusCode;
}
