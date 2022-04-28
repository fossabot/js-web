import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import ARStatusCode from './ARStatusCode.enum';

export class ARCountryRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  CountryCode: string;

  @IsString()
  @ApiProperty()
  EligibleCountry: string;

  @IsOptional()
  @IsEnum(ARStatusCode)
  @ApiPropertyOptional()
  StatusCode?: ARStatusCode;
}
