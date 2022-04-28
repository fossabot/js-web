import { ICourseSession } from './course';
import { User } from './user';

export enum Reason {
  CancelledByUser = 'CancelledByUser',
  CancelledByAdmin = 'CancelledByAdmin',
  CancelledSession = 'CancelledSession',
}

export interface UserCourseSessionCancellationLog {
  userId: string;

  user: User;

  courseSessionId: string;

  courseSession: ICourseSession;

  cancelledByUser: User;

  reason: Reason;
}
