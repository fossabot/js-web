import { isAfter, isBefore } from 'date-fns';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

import { Base } from '../base/Base.entity';
import { CourseLanguage } from './courseLanguage.enum';
import { CourseOutline } from './CourseOutline.entity';
import { CourseSessionBooking } from './CourseSessionBooking.entity';
import { CourseSessionInstructor } from './CourseSessionInstructor.entity';
import { CourseSessionStatus } from './CourseSessionStatus.enum';

@Entity()
export class CourseSession extends Base {
  @ManyToOne(() => CourseOutline, {
    nullable: false,
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  courseOutline: CourseOutline;

  @Column({ nullable: false })
  seats!: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  webinarTool?: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  participantUrl?: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  location?: string | null;

  @Column({ type: 'timestamptz', nullable: false })
  startDateTime!: Date;

  @Column({ type: 'timestamptz', nullable: false })
  endDateTime!: Date;

  @Column({ type: 'enum', enum: CourseLanguage, nullable: true })
  language!: CourseLanguage;

  @Column({ type: Boolean, default: false, nullable: false })
  isPrivate!: boolean;

  @OneToMany(
    () => CourseSessionInstructor,
    (courseSessionInstructor) => courseSessionInstructor.courseSession,
    { cascade: true },
  )
  courseSessionInstructor: CourseSessionInstructor[];

  @OneToMany(
    () => CourseSessionBooking,
    (courseSessionBooking) => courseSessionBooking.courseSession,
    { cascade: true, eager: false },
  )
  courseSessionBooking: CourseSessionBooking[];

  @Column({ default: false })
  cancelled!: boolean;

  get status(): CourseSessionStatus {
    // eslint-disable-next-line no-use-before-define
    return getStatus({ ...this });
  }
}

export const getStatus = (val: {
  cancelled: boolean;
  startDateTime: Date;
  endDateTime: Date;
}) => {
  if (val.cancelled) return CourseSessionStatus.CANCELLED;

  const now = new Date();
  if (isBefore(now, val.startDateTime)) return CourseSessionStatus.NOT_STARTED;
  if (isAfter(now, val.startDateTime) && isBefore(now, val.endDateTime))
    return CourseSessionStatus.IN_PROGRESS;
  if (isAfter(now, val.endDateTime)) return CourseSessionStatus.COMPLETED;

  throw new Error('Unknown session status');
};
