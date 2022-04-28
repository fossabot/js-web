import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import ARStatusCode from './ARStatusCode.enum';

export class ARUOMRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  UOMCode: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  UOMName: string;

  @IsOptional()
  @IsEnum(ARStatusCode)
  @ApiPropertyOptional()
  StatusCode?: ARStatusCode;
}
