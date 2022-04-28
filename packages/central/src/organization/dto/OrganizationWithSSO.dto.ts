import { Expose } from 'class-transformer';

import { SSOConfig } from '@seaccentral/core/dist/dto/SSOConfig.dto';
import { Organization } from '@seaccentral/core/dist/organization/Organization.entity';
import { ApiProperty } from '@nestjs/swagger';

export class OrganizationWithSSO extends Organization {
  @Expose()
  @ApiProperty()
  sso: SSOConfig;

  @Expose()
  @ApiProperty()
  isSSOSetup?: boolean;

  constructor(partial: Partial<Organization>) {
    super();
    Object.assign(this, partial);
  }
}
