import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Base } from '../base/Base.entity';
import { User } from '../user/User.entity';
import { Course } from './Course.entity';

@Entity()
@Unique('user_archived_course_unique', ['courseId', 'userId'])
export class UserArchivedCourse extends Base {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  private courseId!: string;

  @ManyToOne(() => Course, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  course!: Course;

  @Column({ nullable: false })
  private userId!: string;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user!: User;
}
