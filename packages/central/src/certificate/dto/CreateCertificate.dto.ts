import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  CertificationOrientation,
  CertificationType,
} from '@seaccentral/core/dist/certificate/certificate.enum';
import { IsNullable } from '@seaccentral/core/dist/utils/custom-validator';
import {
  IsEnum,
  IsHash,
  IsIn,
  IsNotEmpty,
  IsPositive,
  IsString,
} from 'class-validator';
import mime from 'mime';

export class CreateCertificateDto {
  @IsEnum(CertificationType)
  @IsNullable()
  @ApiPropertyOptional({ enum: CertificationType, nullable: true })
  certType: CertificationType;

  @IsEnum(CertificationOrientation)
  @ApiPropertyOptional({ enum: CertificationOrientation })
  orientation: CertificationOrientation;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  filename: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  provider: string;

  @IsIn([mime.getType('png'), mime.getType('jpeg')])
  @ApiProperty()
  mime: string;

  @IsPositive()
  @ApiProperty()
  bytes: number;

  @IsHash('sha256')
  @ApiProperty()
  hash: string;
}
