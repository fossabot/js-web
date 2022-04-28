import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserUploadType } from '../user/UserUploadType.enum';

export class UserUploadFileDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  key: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  organizationId?: string;

  @IsNotEmpty()
  @ApiProperty({ enum: UserUploadType })
  uploadType: UserUploadType;
}
