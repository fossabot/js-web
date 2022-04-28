import { Column, Entity, ManyToOne, Unique } from 'typeorm';

import { Base } from '../base/Base.entity';
import { User } from '../user/User.entity';
import { LearningTrack } from './LearningTrack.entity';

export enum UserAssignedLearningTrackType {
  Optional = 'optional',
}

@Entity()
@Unique('user_assigned_learning_track_unique', ['learningTrackId', 'userId'])
export class UserAssignedLearningTrack extends Base {
  @Column({ nullable: false })
  learningTrackId!: string;

  @ManyToOne(() => LearningTrack, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  learningTrack!: LearningTrack;

  @Column({ nullable: false })
  userId!: string;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user!: User;

  @Column({
    type: 'enum',
    enum: UserAssignedLearningTrackType,
    nullable: false,
    default: UserAssignedLearningTrackType.Optional,
  })
  assignmentType!: UserAssignedLearningTrackType;

  @Column({ type: 'timestamptz', nullable: true })
  dueDateTime?: Date | null;
}
