import { Column, Entity, ManyToOne, Unique } from 'typeorm';

import { Base } from '../base/Base.entity';
import { Course } from '../course/Course.entity';
import { LearningTrackSection } from './LearningTrackSection.entity';

@Entity()
@Unique('learning_track_section_course_unique', [
  'learningTrackSectionId',
  'courseId',
])
export class LearningTrackSectionCourse extends Base {
  @Column({ nullable: false })
  private courseId!: string;

  @Column({ nullable: false })
  private learningTrackSectionId!: string;

  @ManyToOne(() => Course, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE',
  })
  course!: Course;

  @ManyToOne(() => LearningTrackSection, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE',
  })
  learningTrackSection!: LearningTrackSection;

  @Column({ nullable: false, default: true })
  isRequired!: boolean;
}
