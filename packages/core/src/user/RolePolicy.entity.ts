import { Column, Entity, ManyToOne, Unique } from 'typeorm';

import { Role } from './Role.entity';
import { Policy } from './Policy.entity';
import { Base } from '../base/Base.entity';

@Entity()
@Unique('role_policy_unique', ['roleId', 'policyId'])
export class RolePolicy extends Base {
  @Column({ nullable: false })
  private roleId!: string;

  @ManyToOne(() => Role, {
    eager: true,
    onDelete: 'CASCADE',
  })
  role: Role;

  @Column({ nullable: false })
  private policyId!: string;

  @ManyToOne(() => Policy, { eager: true, onDelete: 'CASCADE' })
  policy: Policy;
}
