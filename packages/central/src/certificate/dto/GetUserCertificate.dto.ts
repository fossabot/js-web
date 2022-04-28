/* eslint-disable max-classes-per-file */

import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { CertificationOrientation } from '@seaccentral/core/dist/certificate/certificate.enum';
import { UserCertificate } from '@seaccentral/core/dist/certificate/UserCertificate.entity';
import { BaseEntityFullDto } from '@seaccentral/core/dist/dto/BaseEntity.dto';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class GetUserCertificateDto extends IntersectionType(
  BaseEntityFullDto,
  UserCertificate,
) {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  certificateId: string;

  @Expose()
  @ApiProperty()
  get title() {
    return this.certificate.title;
  }

  @Expose()
  @ApiProperty()
  get provider() {
    return this.certificate.provider;
  }

  @Expose()
  @ApiProperty({ enum: CertificationOrientation })
  get orientation() {
    return this.certificate.orientation;
  }

  @Expose()
  @ApiProperty()
  completedDate: Date;

  @Expose()
  @ApiProperty()
  get courseTag() {
    // TODO: once we setup certificate rules, we can get this by finding the associated tags
    // on the course level of this certificate
    return undefined;
  }

  @Expose()
  @ApiProperty()
  get courseId() {
    // TODO: once we setup certificate rules, we can get this by finding the associated tags
    // on the course level of this certificate
    return undefined;
  }

  constructor(data: UserCertificate) {
    super();
    Object.assign(this, data);
  }
}
