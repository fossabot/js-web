import { CourseSessionBookingStatus } from '@seaccentral/core/dist/course/CourseSessionBooking.entity';
import { User } from '@seaccentral/core/dist/user/User.entity';

export class CourseSessionMarkAttendanceBody {
  status:
    | CourseSessionBookingStatus.ATTENDED
    | CourseSessionBookingStatus.NOT_ATTENDED;

  studentIds: User['id'][];
}
