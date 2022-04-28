import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNullable } from '@seaccentral/core/dist/utils/custom-validator';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class SaveSystemAnnouncementDto {
  @IsUUID(4)
  @IsOptional()
  @ApiPropertyOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  titleEn: string;

  @IsString()
  @ApiProperty()
  titleTh: string;

  @IsString()
  @ApiProperty()
  messageEn: string;

  @IsString()
  @ApiProperty()
  messageTh: string;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty()
  endDate: string;

  @IsDateString()
  @IsNullable()
  @ApiProperty()
  messageStartDateTime: string | null;

  @IsDateString()
  @IsNullable()
  @ApiProperty()
  messageEndDateTime: string | null;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiPropertyOptional()
  imageKey?: string;
}
