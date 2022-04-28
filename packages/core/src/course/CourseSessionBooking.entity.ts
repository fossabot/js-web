import { Column, Entity, ManyToOne, Unique } from 'typeorm';

import { Base } from '../base/Base.entity';
import { User } from '../user/User.entity';
import { CourseSession } from './CourseSession.entity';

export enum CourseSessionBookingStatus {
  NO_MARK = 'NO_MARK',
  ATTENDED = 'ATTENDED',
  NOT_ATTENDED = 'NOT_ATTENDED',
  CANCELLED = 'CANCELLED',
}
@Entity()
@Unique('course_session_booking_unique', ['studentId', 'courseSessionId'])
export class CourseSessionBooking extends Base {
  @Column({ nullable: false })
  studentId!: string;

  @ManyToOne(() => User, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE',
  })
  student: User;

  @Column({ nullable: false })
  courseSessionId!: string;

  @ManyToOne(() => CourseSession, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE',
  })
  courseSession: CourseSession;

  @Column({
    enum: CourseSessionBookingStatus,
    default: CourseSessionBookingStatus.NO_MARK,
  })
  status: CourseSessionBookingStatus;
}
