import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class OrganizationBody {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  setupOrganizationSSO?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  ssoLoginUrl?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  issuer?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  nameidFormat?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiPropertyOptional()
  metadataKey?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiPropertyOptional()
  certificateKey?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  certificateFileName?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  metadataFileName?: string;

  // SP
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  spIssuer?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  spAcsUrl?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiPropertyOptional()
  spMetadataKey?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiPropertyOptional()
  spCertificateKey?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  spMetadataFileName?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  spCertificateFileName?: string;

  @IsBoolean()
  @IsNotEmpty()
  @IsOptional()
  @ApiPropertyOptional()
  isServiceProvider?: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @IsOptional()
  @ApiPropertyOptional()
  isIdentityProvider?: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @IsOptional()
  @ApiPropertyOptional()
  showOnlySubscribedCourses?: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @IsOptional()
  @ApiPropertyOptional()
  disableUpgrade?: boolean;
}
