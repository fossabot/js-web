import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { Tag } from '../tag/Tag.entity';
import { Base } from '../base/Base.entity';
import { Course } from './Course.entity';

@Entity()
@Unique('course_tag_unique', ['tag', 'course'])
export class CourseTag extends Base {
  @Column({ nullable: false })
  private courseId!: string;

  @Column({ nullable: false })
  private tagId!: string;

  @ManyToOne(() => Course, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE',
  })
  course!: Course;

  @ManyToOne(() => Tag, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE',
  })
  tag!: Tag;
}
