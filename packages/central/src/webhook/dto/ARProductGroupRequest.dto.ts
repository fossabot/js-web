import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import ARStatusCode from './ARStatusCode.enum';

export class ARProductGroupRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  ProductGroupCode: string;

  @IsString()
  @ApiProperty()
  ProductGroupName: string;

  @IsOptional()
  @IsEnum(ARStatusCode)
  @ApiPropertyOptional()
  StatusCode?: ARStatusCode;
}
