import { Exclude, Expose, Transform } from 'class-transformer';

import { User } from '@seaccentral/core/dist/user/User.entity';
import { Group } from '@seaccentral/core/dist/group/Group.entity';
import { GroupUser } from '@seaccentral/core/dist/group/GroupUser.entity';

@Exclude()
export class GroupUserResponse extends GroupUser {
  @Expose()
  id: string;

  @Expose()
  group: Group;

  @Expose()
  @Transform(({ value }: { value: User }) => ({
    id: value.id,
    email: value.email,
    firstName: value.firstName,
    lastName: value.lastName,
    isActivated: value.isActivated,
    fullName: `${value.firstName} ${value.lastName}`,
  }))
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  user: Partial<User>;

  @Expose()
  isSSOSetup?: boolean;

  constructor(partial: Partial<GroupUser>) {
    super();
    Object.assign(this, partial);
  }
}
