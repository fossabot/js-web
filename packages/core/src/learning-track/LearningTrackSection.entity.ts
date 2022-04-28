import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

import { Base } from '../base/Base.entity';
import { Language } from '../language/Language.entity';
import { LearningTrack } from './LearningTrack.entity';
import { LearningTrackSectionCourse } from './LearningTrackSectionCourse.entity';

@Entity()
export class LearningTrackSection extends Base {
  @ManyToOne(() => Language, {
    eager: true,
    nullable: true,
    cascade: true,
    onDelete: 'SET NULL',
  })
  title: Language | null;

  @Column({ nullable: false })
  part!: number;

  @Column()
  learningTrackId: string;

  @ManyToOne(() => LearningTrack, {
    nullable: false,
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  learningTrack!: LearningTrack;

  @OneToMany(
    () => LearningTrackSectionCourse,
    (learningTrackSectionCourse) =>
      learningTrackSectionCourse.learningTrackSection,
    {
      cascade: true,
    },
  )
  learningTrackSectionCourse: LearningTrackSectionCourse[];
}
