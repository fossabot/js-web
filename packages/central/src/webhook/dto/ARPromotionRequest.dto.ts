import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import ARStatusCode from './ARStatusCode.enum';

export class ARPromotionRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  PromotionCode: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  PromotionName: string;

  @IsOptional()
  @IsEnum(ARStatusCode)
  @ApiPropertyOptional()
  StatusCode?: ARStatusCode;
}
