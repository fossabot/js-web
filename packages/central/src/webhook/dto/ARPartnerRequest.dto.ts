import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import ARStatusCode from './ARStatusCode.enum';

export class ARPartnerRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  PartnerCode: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  PartnerName: string;

  @IsOptional()
  @IsEnum(ARStatusCode)
  @ApiPropertyOptional()
  StatusCode?: ARStatusCode;
}
