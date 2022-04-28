import { Column, Entity, ManyToOne, Unique } from 'typeorm';

import { Base } from '../base/Base.entity';
import { User } from '../user/User.entity';
import { Organization } from './Organization.entity';

@Entity()
@Unique('organization_user_unique', ['userId', 'organizationId'])
export class OrganizationUser extends Base {
  @Column({ nullable: false })
  private organizationId!: string;

  @Column({ nullable: false })
  private userId!: string;

  @ManyToOne(() => Organization, {
    eager: true,
    nullable: false,
    onDelete: 'CASCADE',
  })
  organization: Organization;

  @ManyToOne(() => User, {
    eager: true,
    nullable: false,
    onDelete: 'CASCADE',
  })
  user: User;
}
