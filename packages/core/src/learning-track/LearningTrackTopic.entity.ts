import { Column, Entity, ManyToOne, Unique } from 'typeorm';

import { Base } from '../base/Base.entity';
import { Topic } from '../topic/Topic.entity';
import { LearningTrack } from './LearningTrack.entity';

@Entity()
@Unique('learning_track_topic_unique', ['topic', 'learningTrack'])
export class LearningTrackTopic extends Base {
  @Column({ nullable: false })
  private learningTrackId!: string;

  @Column({ nullable: false })
  private topicId!: string;

  @ManyToOne(() => LearningTrack, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE',
  })
  learningTrack!: LearningTrack;

  @ManyToOne(() => Topic, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE',
  })
  topic!: Topic;
}
