import { CourseSessionBookingStatus } from '@seaccentral/core/dist/course/CourseSessionBooking.entity';

export interface IRawActiveParticipants {
  booking_id: string;
  booking_isActive: string;
  booking_createdAt: string;
  booking_updatedAt: string;
  booking_studentId: string;
  booking_courseSessionId: string;
  expiryDate?: Date | null;
  booking_status: CourseSessionBookingStatus;
  userId: string;
}
