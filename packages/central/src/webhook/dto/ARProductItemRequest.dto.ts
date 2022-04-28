import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import ARStatusCode from './ARStatusCode.enum';

export class ARProductItemRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  ProductItemsCode: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  DetailProductItemsName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  ProductItemStatus: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  ProgramExpiryDate?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  Language?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  ScheduleType?: string;

  @IsOptional()
  @IsEnum(ARStatusCode)
  @ApiPropertyOptional()
  StatusCode?: ARStatusCode;
}
