import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CourseOutline } from '@seaccentral/core/dist/course/CourseOutline.entity';
import { CourseSession } from '@seaccentral/core/dist/course/CourseSession.entity';
import { Exclude, Expose } from 'class-transformer';

export class CourseOutlineResponse extends CourseOutline {
  @Exclude()
  courseSession: CourseSession[];

  isBookingEligible: boolean;

  @Expose()
  @ApiProperty()
  get isBooked() {
    if (this.courseSession) {
      const hasBooking = this.courseSession.find(
        (session) =>
          session.courseSessionBooking &&
          session.courseSessionBooking.length > 0,
      );
      if (hasBooking) return true;
    }

    return false;
  }

  @Expose()
  @ApiPropertyOptional()
  get availableSessionCount() {
    return this.courseSession?.filter((session) => {
      const { isPrivate } = session;

      const sessionWithSeatsBooked = session as CourseSession & {
        seatsBooked?: number;
      };

      const availableSeats = sessionWithSeatsBooked.seatsBooked
        ? session.seats - sessionWithSeatsBooked.seatsBooked
        : // Maintaining old compatibility with others controller
          session.seats - session.courseSessionBooking.length;

      return (
        availableSeats > 0 &&
        !isPrivate &&
        // Filtered out booked available session
        session.courseSessionBooking.length === 0
      );
    }).length;
  }

  constructor(partial: Partial<CourseOutline>, isBookingEligible: boolean) {
    super();
    Object.assign(this, partial);
    this.isBookingEligible = isBookingEligible;
  }
}
