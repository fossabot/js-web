import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { Base } from '../base/Base.entity';
import { Course } from './Course.entity';
import { Topic } from '../topic/Topic.entity';

@Entity()
@Unique('course_topic_unique', ['topic', 'course'])
export class CourseTopic extends Base {
  @Column({ nullable: false })
  private courseId!: string;

  @Column({ nullable: false })
  private topicId!: string;

  @ManyToOne(() => Course, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE',
  })
  course!: Course;

  @ManyToOne(() => Topic, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE',
  })
  topic!: Topic;
}
