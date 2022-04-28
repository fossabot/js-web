import { Column, Entity, Index, ManyToOne } from 'typeorm';

import { User } from './User.entity';
import { Role } from './Role.entity';
import { Base } from '../base/Base.entity';

@Entity()
@Index(['user', 'role'], { unique: true })
export class UserRole extends Base {
  @ManyToOne(() => User, {
    eager: true,
    nullable: false,
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => Role, {
    eager: true,
    nullable: false,
    onDelete: 'CASCADE',
  })
  role: Role;

  @Column({ default: true })
  isDefault: boolean;
}
