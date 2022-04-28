import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import ARStatusCode from './ARStatusCode.enum';

export class ARProductSubGroupRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  SubProductGroupCode: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  ProductGroupCode: string;

  @IsString()
  @ApiProperty()
  SubProductGroupName: string;

  @IsOptional()
  @IsEnum(ARStatusCode)
  @ApiPropertyOptional()
  StatusCode?: ARStatusCode;
}
