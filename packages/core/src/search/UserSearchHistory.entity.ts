import { Column, Entity, ManyToOne } from 'typeorm';

import { User } from '../user/User.entity';
import { Base } from '../base/Base.entity';

export enum SearchType {
  COURSE = 'course',
  LEARNING_TRACK = 'learningTrack',
  INSTRUCTOR = 'instructor',
}

@Entity()
export class UserSearchHistory extends Base {
  @Column({ nullable: false })
  private userId!: string;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user!: User;

  @Column({ nullable: false })
  term!: string;

  @Column({
    type: 'enum',
    enum: SearchType,
    nullable: false,
    default: SearchType.COURSE,
  })
  type!: SearchType;
}
