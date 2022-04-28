import { Column, Entity, ManyToOne, Unique } from 'typeorm';

import { Course } from './Course.entity';
import { User } from '../user/User.entity';
import { Base } from '../base/Base.entity';
import { UserEnrolledCourseStatus } from './UserEnrolledCourseStatus.enum';

@Entity()
@Unique('user_enrolled_course_unique', ['userId', 'courseId'])
export class UserEnrolledCourse extends Base {
  @Column({ nullable: false })
  userId!: string;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user!: User;

  @Column({ nullable: false })
  private courseId!: string;

  @ManyToOne(() => Course, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  course!: Course;

  @Column({
    type: 'enum',
    enum: UserEnrolledCourseStatus,
    default: UserEnrolledCourseStatus.ENROLLED,
    nullable: false,
  })
  status!: UserEnrolledCourseStatus;

  @Column({ default: 0, nullable: false })
  percentage: number;
}
