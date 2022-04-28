import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { GetCertificateDto } from './GetCertificate.dto';

export class UploadCertificateDto {
  @Type(() => GetCertificateDto)
  @ApiProperty({ type: GetCertificateDto })
  certificate: GetCertificateDto;

  @ApiProperty({
    properties: {
      url: {
        type: 'string',
      },
      fields: {
        type: 'object',
      },
    },
  })
  s3Params: {
    url: string;
    fields: Record<string, any>;
  };

  constructor(data: UploadCertificateDto) {
    Object.assign(this, data);
  }
}
