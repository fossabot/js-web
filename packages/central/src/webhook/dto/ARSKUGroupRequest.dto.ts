import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import ARStatusCode from './ARStatusCode.enum';

export class ARSKUGroupRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  SKUGroupCode: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  SubProductGroupCode?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  ProductGroupCode?: string;

  @IsString()
  @ApiProperty()
  SKUGroup: string;

  @IsOptional()
  @IsEnum(ARStatusCode)
  @ApiPropertyOptional()
  StatusCode?: ARStatusCode;
}
