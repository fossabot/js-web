/* eslint-disable max-classes-per-file */

import {
  ApiProperty,
  ApiPropertyOptional,
  IntersectionType,
} from '@nestjs/swagger';
import { Certificate } from '@seaccentral/core/dist/certificate/certificate.entity';
import {
  CertificationOrientation,
  CertificationType,
} from '@seaccentral/core/dist/certificate/certificate.enum';
import { BaseEntityFullDto } from '@seaccentral/core/dist/dto/BaseEntity.dto';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { Exclude, Transform } from 'class-transformer';

@Exclude()
class PartialUser extends User {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ type: 'string', nullable: true })
  email?: string;

  @ApiProperty({ type: 'string', nullable: true })
  firstName: string | null;

  @ApiProperty({ type: 'string', nullable: true })
  lastName: string | null;
}

export class GetCertificateDto extends IntersectionType(
  BaseEntityFullDto,
  Certificate,
) {
  @ApiProperty({ enum: CertificationOrientation })
  orientation: CertificationOrientation;

  @ApiPropertyOptional({ enum: CertificationType })
  certType?: CertificationType;

  @ApiProperty()
  title: string;

  @ApiProperty()
  mime: string;

  @ApiProperty()
  filename: string;

  @ApiProperty()
  key: string;

  @ApiProperty()
  bytes: number;

  @ApiProperty()
  hash: string;

  @ApiProperty()
  provider: string;

  @Transform(({ value }: { value: User }) => ({
    id: value.id,
    email: value.email,
    firstName: value.firstName,
    lastName: value.lastName,
  }))
  @ApiProperty({ type: () => PartialUser })
  uploader: User;

  constructor(data: Certificate) {
    super();
    Object.assign(this, data);
  }
}
