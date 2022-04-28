import { Column, Entity, ManyToOne, Unique } from 'typeorm';

import { Tag } from '../tag/Tag.entity';
import { Base } from '../base/Base.entity';
import { LearningTrack } from './LearningTrack.entity';

@Entity()
@Unique('learning_track_tag_unique', ['tag', 'learningTrack'])
export class LearningTrackTag extends Base {
  @Column({ nullable: false })
  private learningTrackId!: string;

  @Column({ nullable: false })
  private tagId!: string;

  @ManyToOne(() => LearningTrack, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE',
  })
  learningTrack!: LearningTrack;

  @ManyToOne(() => Tag, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE',
  })
  tag!: Tag;
}
