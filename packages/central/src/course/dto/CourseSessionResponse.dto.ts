import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CourseOutline } from '@seaccentral/core/dist/course/CourseOutline.entity';
import { CourseSession } from '@seaccentral/core/dist/course/CourseSession.entity';
import { CourseSessionBooking } from '@seaccentral/core/dist/course/CourseSessionBooking.entity';
import { CourseSessionInstructor } from '@seaccentral/core/dist/course/CourseSessionInstructor.entity';
import { Course } from '@seaccentral/core/dist/course/Course.entity';
import { Exclude, Expose } from 'class-transformer';

export class CourseSessionResponse extends CourseSession {
  private bookerId?: string;

  @Expose()
  @ApiProperty()
  get instructors() {
    return this.courseSessionInstructor.map((csi) => ({
      id: csi.instructor.id,
      firstName: csi.instructor.firstName,
      lastName: csi.instructor.lastName,
      email: csi.instructor.email,
      profileImageKey: csi.instructor.profileImageKey,
    }));
  }

  @Expose()
  @ApiProperty()
  get availableSeats() {
    const reservedSeats =
      this.courseSessionBooking && this.courseSessionBooking.length
        ? this.courseSessionBooking.length
        : 0;

    const seats = this.seats - reservedSeats;
    return seats >= 0 ? seats : 0;
  }

  @Expose()
  @ApiProperty()
  get isBooked() {
    if (this.courseSessionBooking && this.courseSessionBooking.length) {
      return this.courseSessionBooking.some(
        (booking) => booking.studentId === this.bookerId,
      );
    }
    return false;
  }

  @Expose()
  @ApiProperty()
  get courseOutlineId() {
    return this.courseOutline.id;
  }

  @Expose()
  @ApiPropertyOptional()
  get courseId() {
    return this.courseOutline?.course?.id;
  }

  @Expose()
  @ApiPropertyOptional()
  get courseTitle() {
    return this.courseOutline?.course?.title;
  }

  @Expose()
  @ApiPropertyOptional()
  get courseOutlineTitle() {
    return this.courseOutline?.title;
  }

  @Expose()
  @ApiPropertyOptional()
  get courseOutlineCategory() {
    return this.courseOutline?.category;
  }

  @Expose()
  @ApiPropertyOptional()
  get courseOutlineLearningWay() {
    return this.courseOutline?.learningWay;
  }

  @Expose()
  @ApiPropertyOptional()
  get courseImageKey() {
    return this.courseOutline?.course?.imageKey;
  }

  @Expose()
  @ApiPropertyOptional()
  get courseTopics() {
    return this.courseOutline?.course?.courseTopic?.map(
      (courseTopic) => courseTopic.topic,
    );
  }

  @Expose()
  @ApiPropertyOptional()
  get hasCertificate() {
    const courseWithCertificateCount = this.courseOutline.course as Course & {
      certificateCount?: number;
    };

    return courseWithCertificateCount?.certificateCount
      ? courseWithCertificateCount.certificateCount > 0
      : undefined;
  }

  @Expose()
  @ApiPropertyOptional()
  get isEnrolled() {
    const courseWithIsEnrolled = this.courseOutline
      ?.course as Partial<Course> & { isEnrolled: number };

    return Boolean(courseWithIsEnrolled.isEnrolled);
  }

  @Exclude()
  courseSessionInstructor: CourseSessionInstructor[];

  @Exclude()
  courseSessionBooking: CourseSessionBooking[];

  @Exclude()
  courseOutline: CourseOutline;

  constructor(partial: Partial<CourseSession>, bookerId?: string) {
    super();
    Object.assign(this, partial);
    this.bookerId = bookerId;
  }
}
