import { Column, Entity, ManyToOne, Unique } from 'typeorm';

import { Course } from './Course.entity';
import { Base } from '../base/Base.entity';
import { User } from '../user/User.entity';

export enum UserAssignedCourseType {
  Optional = 'optional',
  Required = 'required',
}

@Entity()
@Unique('user_assigned_course_unique', ['courseId', 'userId'])
export class UserAssignedCourse extends Base {
  @Column({ nullable: false })
  courseId!: string;

  @ManyToOne(() => Course, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  course!: Course;

  @Column({ nullable: false })
  userId!: string;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user!: User;

  @Column({
    type: 'enum',
    enum: UserAssignedCourseType,
    nullable: false,
    default: UserAssignedCourseType.Optional,
  })
  assignmentType!: UserAssignedCourseType;

  @Column({ type: 'timestamptz', nullable: true })
  dueDateTime?: Date | null;
}
