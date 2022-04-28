import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import ARStatusCode from './ARStatusCode.enum';

export class ARSKULineRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  SKUCode: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  ProductItemsCode: string;

  @IsOptional()
  @IsEnum(ARStatusCode)
  @ApiPropertyOptional()
  StatusCode?: ARStatusCode;
}
