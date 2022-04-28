import { Column, Entity, ManyToOne } from 'typeorm';
import { Base } from '../base/Base.entity';
import { User } from '../user/User.entity';
import { CourseSession } from './CourseSession.entity';

export enum Reason {
  CancelledByUser = 'CancelledByUser',
  CancelledByAdmin = 'CancelledByAdmin',
  CancelledSession = 'CancelledSession',
}

@Entity()
export class UserCourseSessionCancellationLog extends Base {
  @Column({ nullable: false })
  userId!: string;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user!: User;

  @Column({ nullable: false })
  private courseSessionId!: string;

  @ManyToOne(() => CourseSession, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  courseSession!: CourseSession;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  cancelledByUser: User;

  @Column({ default: Reason.CancelledByUser, enum: Reason, type: 'enum' })
  reason: Reason;
}
