import { ApiResponseProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ARResponse {
  @IsNumber()
  @IsNotEmpty()
  @ApiResponseProperty()
  Code: number;

  @IsString()
  @IsNotEmpty()
  @ApiResponseProperty()
  Message: string;

  @IsString()
  @IsOptional()
  @ApiResponseProperty()
  Detail?: string;
}
