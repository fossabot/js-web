import { Base } from './base';
import { ICourseOutline } from './course';
import { User } from './user';

export enum UserCourseOutlineProgressStatus {
  ENROLLED = 'enrolled',
  IN_PROGRESS = 'inProgress',
  COMPLETED = 'completed',
}

export interface UserCourseOutlineProgress extends Base {
  status: UserCourseOutlineProgressStatus;
  percentage: number;
  userId: string;
  user?: User;
  courseOutlineId: string;
  courseOutline?: ICourseOutline;
}
