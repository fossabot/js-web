import { IUser } from './auth';
import { Base } from './base';
import { ICourse } from './course';

export enum UserAssignedCourseType {
  Optional = 'optional',
  Required = 'required',
}

export interface UserAssignedCourse extends Base {
  assignmentType: UserAssignedCourseType;
  dueDateTime: Date | null;
  course: Pick<ICourse<string>, 'id' | 'title'>;
  user: Pick<IUser, 'id' | 'email' | 'firstName' | 'lastName'>;
  groupName?: string;
  organizationName?: string;
}
