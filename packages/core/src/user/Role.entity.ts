import { Entity, Column, OneToMany } from 'typeorm';

import { Base } from '../base/Base.entity';
import { RolePolicy } from './RolePolicy.entity';

@Entity()
export class Role extends Base {
  @Column({ nullable: false, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description?: string;

  @Column({ default: false })
  isSystemDefined: boolean;

  @OneToMany(() => RolePolicy, (rolePolicy) => rolePolicy.role, {
    cascade: true,
  })
  rolePolicy: RolePolicy[];
}
