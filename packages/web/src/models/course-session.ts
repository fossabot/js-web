import { Base } from './base';
import {
  CourseSessionBookingStatus,
  CourseSessionStatus,
  CourseSubCategoryKey,
} from './course';

export class CourseSession {
  id: string;
  seats: number;
  location?: string;
  startDateTime: string;
  endDateTime: string;
  webinarTool: string;
}
export class CourseSessionOverview extends CourseSession {
  courseId: string;
  courseTitle: string;
  courseImageKey: string;
  courseLanguage: string;
  courseOutlineId: string;
  courseSubCategoryKey: CourseSubCategoryKey;
  booked: number;
  instructorName: string;
  sessionStatus: CourseSessionStatus;
}

export interface UserUpcomingBooking {
  endDateTime: string;
  startDateTime: string;
  id: string;
  title: string;
}
