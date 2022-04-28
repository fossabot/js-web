import { Base } from './base';
import { Reason } from './userCourseSessionCancellationLog';

export interface ICancelledAttendant extends Base {
  subscriptionExpiryDate?: Date | null;
  organizationName: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  cancelledReason?: Reason | null;
}
