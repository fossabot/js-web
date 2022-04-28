import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Base } from '../base/Base.entity';
import { LearningTrack } from './LearningTrack.entity';
import { User } from '../user/User.entity';

@Entity()
@Unique('user_archived_learning_track_unique', ['learningTrackId', 'userId'])
export class UserArchivedLearningTrack extends Base {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  private learningTrackId!: string;

  @ManyToOne(() => LearningTrack, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  learningTrack!: LearningTrack;

  @Column({ nullable: false })
  private userId!: string;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user!: User;
}
