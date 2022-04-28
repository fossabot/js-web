import { Exclude, Expose } from 'class-transformer';

import { Role } from '@seaccentral/core/dist/user/Role.entity';

@Exclude()
export class RoleResponse extends Role {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  isSystemDefined: boolean;

  @Expose()
  get policies() {
    return this.rolePolicy?.map((rp) => rp.policy);
  }

  constructor(role: Partial<Role>) {
    super();
    Object.assign(this, role);
  }
}
