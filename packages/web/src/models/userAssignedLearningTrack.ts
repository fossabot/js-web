import { IUser } from './auth';
import { Base } from './base';
import { ILearningTrack } from './learningTrack';

export enum UserAssignedLearningTrackType {
  Optional = 'optional',
}

export interface UserAssignedLearningTrack extends Base {
  assignmentType: UserAssignedLearningTrackType;
  dueDateTime: Date | null;
  learningTrack: Pick<ILearningTrack<string>, 'id' | 'title'>;
  user: Pick<IUser, 'id' | 'email' | 'firstName' | 'lastName'>;
  groupName?: string;
  organizationName?: string;
}
