/* eslint-disable max-classes-per-file */

import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { BaseEntityFullDto } from '@seaccentral/core/dist/dto/BaseEntity.dto';
import { OrganizationWithSSO } from './OrganizationWithSSO.dto';

class OrganizationResponseBodyDto extends OrganizationWithSSO {
  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiProperty({ nullable: true })
  logo?: string;

  @ApiProperty()
  isIdentityProvider!: boolean;

  @ApiProperty()
  isServiceProvider!: boolean;
}

export class OrganizationResponseDto extends IntersectionType(
  OrganizationResponseBodyDto,
  BaseEntityFullDto,
) {}
