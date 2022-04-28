import { Base } from './base';
import { Organization } from './organization';
import { User } from './user';

export interface OrganizationUser extends Base {
  organizationId: string;

  userId: string;

  organization: Organization;

  user: User;
}
