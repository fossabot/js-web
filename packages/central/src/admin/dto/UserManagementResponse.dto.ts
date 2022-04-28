import { Expose, Exclude, Transform } from 'class-transformer';
import { ApiResponseProperty } from '@nestjs/swagger';

import { Role } from '@seaccentral/core/dist/user/Role.entity';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { Organization } from '@seaccentral/core/dist/organization/Organization.entity';
import { Invitation } from '@seaccentral/core/dist/invitation/Invitation.entity';

import invitedUserTransformer from '../transformer/invitedUserTransformer';

@Exclude()
export class UserManagementResponse extends User {
  @ApiResponseProperty()
  @Expose()
  id: string;

  @ApiResponseProperty()
  @Expose()
  firstName: string;

  @ApiResponseProperty()
  @Expose()
  lastName: string;

  @ApiResponseProperty()
  @Expose()
  email: string;

  @ApiResponseProperty()
  @Expose()
  organization?: Organization;

  @ApiResponseProperty()
  @Expose()
  role?: Role;

  @ApiResponseProperty()
  @Expose()
  @Transform(invitedUserTransformer)
  invitedBy?: User;

  @ApiResponseProperty()
  @Expose()
  isActive: boolean;

  constructor(partial: Partial<Invitation>) {
    super();
    Object.assign(this, partial);
  }
}
