import { Base } from './base';
import { CourseSessionBookingStatus } from './course';

interface SessionAttendance extends Base {
  subscriptionExpiryDate?: Date | null;
  organizationName: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  bookingStatus: CourseSessionBookingStatus;
}

export default SessionAttendance;
