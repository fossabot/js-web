import { Column, Entity, ManyToOne, Unique } from 'typeorm';

import { User } from '../user/User.entity';
import { Base } from '../base/Base.entity';
import { LearningTrack } from './LearningTrack.entity';
import { UserEnrolledLearningTrackStatus } from './UserEnrolledLearningTrackStatus.enum';

@Entity()
@Unique('user_enrolled_learning_track_unique', ['userId', 'learningTrackId'])
export class UserEnrolledLearningTrack extends Base {
  @Column({ nullable: false })
  userId!: string;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user!: User;

  @Column({ nullable: false })
  learningTrackId!: string;

  @ManyToOne(() => LearningTrack, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  learningTrack!: LearningTrack;

  @Column({
    type: 'enum',
    enum: UserEnrolledLearningTrackStatus,
    default: UserEnrolledLearningTrackStatus.ENROLLED,
    nullable: false,
  })
  status!: UserEnrolledLearningTrackStatus;
}
