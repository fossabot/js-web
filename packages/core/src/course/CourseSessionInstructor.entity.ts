import { Column, Entity, ManyToOne, Unique } from 'typeorm';

import { Base } from '../base/Base.entity';
import { User } from '../user/User.entity';
import { CourseSession } from './CourseSession.entity';

@Entity()
@Unique('course_session_instructor_unique', ['courseSessionId', 'instructorId'])
export class CourseSessionInstructor extends Base {
  @Column({ nullable: false })
  private courseSessionId!: string;

  @Column({ nullable: false })
  instructorId!: string;

  @ManyToOne(() => CourseSession, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE',
  })
  courseSession!: CourseSession;

  @ManyToOne(() => User, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE',
  })
  instructor!: User;
}
