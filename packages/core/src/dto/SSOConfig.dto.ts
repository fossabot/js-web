import { ApiPropertyOptional } from '@nestjs/swagger';
import { IdentityProviderConfig } from '../sso/IdentityProviderConfig.entity';
import { ServiceProviderConfig } from '../sso/ServiceProviderConfig.entity';

export class SSOConfig {
  @ApiPropertyOptional()
  idp?: Partial<IdentityProviderConfig>;

  @ApiPropertyOptional()
  sp?: Partial<ServiceProviderConfig>;
}
