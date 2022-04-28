import { Column, Entity, ManyToOne, Unique } from 'typeorm';

import { User } from '../user/User.entity';
import { Base } from '../base/Base.entity';
import { CourseOutline } from './CourseOutline.entity';
import { UserCourseOutlineProgressStatus } from './UserCourseOutlineProgressStatus.enum';

@Entity()
@Unique('user_course_outline_progress_unique', ['userId', 'courseOutlineId'])
export class UserCourseOutlineProgress extends Base {
  @Column({
    type: 'enum',
    enum: UserCourseOutlineProgressStatus,
    nullable: false,
  })
  status!: UserCourseOutlineProgressStatus;

  @Column({ default: 0, nullable: false })
  percentage: number;

  @Column({ nullable: false })
  userId!: string;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user!: User;

  @Column({ nullable: false })
  courseOutlineId!: string;

  @ManyToOne(() => CourseOutline, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  courseOutline!: CourseOutline;
}
