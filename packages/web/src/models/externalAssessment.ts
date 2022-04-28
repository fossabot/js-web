import { Base } from './base';
import { ICourseOutline } from './course';
import { User } from './user';

export interface ExternalAssessment extends Base {
  externalId: string;

  status: string;

  assessmentUrl: string;

  reportUrl?: string | null;

  vendor?: string | null;

  courseOutlineId: string;

  courseOutline: ICourseOutline;

  userId: string;

  user: User;
}
