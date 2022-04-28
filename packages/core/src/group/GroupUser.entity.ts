import { Column, Entity, Index, ManyToOne, Unique } from 'typeorm';

import { Group } from './Group.entity';
import { User } from '../user/User.entity';
import { Base } from '../base/Base.entity';

@Entity()
@Index(['userId', 'groupId'], { unique: true })
@Unique('group_user_unique', ['userId', 'groupId'])
export class GroupUser extends Base {
  @Column({ nullable: false })
  private groupId!: string;

  @Column({ nullable: false })
  private userId!: string;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user!: User;

  @ManyToOne(() => Group, {
    eager: true,
    nullable: false,
    onDelete: 'CASCADE',
  })
  group!: Group;
}
