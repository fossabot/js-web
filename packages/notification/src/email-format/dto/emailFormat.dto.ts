import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class EmailFormatRequestDto {
  @IsUUID(4)
  @IsOptional()
  @ApiPropertyOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  formatName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  teamName: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiPropertyOptional()
  headerImageKey?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiPropertyOptional()
  footerImageKey?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  footerHTML?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  copyrightText?: string;

  @IsBoolean()
  @ApiProperty()
  isDefault: boolean;
}
