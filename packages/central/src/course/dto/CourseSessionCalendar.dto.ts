import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CourseSession } from '@seaccentral/core/dist/course/CourseSession.entity';
import { CourseLanguage } from '@seaccentral/core/dist/course/courseLanguage.enum';
import { Exclude, Expose } from 'class-transformer';
import { Course } from '@seaccentral/core/dist/course/Course.entity';

@Exclude()
export class CourseSessionCalendarResponseDto extends CourseSession {
  private bookerId?: string;

  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  startDateTime: Date;

  @Expose()
  @ApiProperty()
  endDateTime: Date;

  @Expose()
  @ApiProperty()
  language: CourseLanguage;

  @Expose()
  @ApiProperty()
  location: string | null;

  @Expose()
  @ApiProperty()
  seats: number;

  @Expose()
  @ApiPropertyOptional()
  get availableSeats() {
    if (this.courseSessionBooking) {
      const seats = this.seats - this.courseSessionBooking.length;
      return seats > 0 ? seats : 0;
    }
    return undefined;
  }

  @Expose()
  @ApiPropertyOptional()
  get isBooked() {
    return this.courseSessionBooking
      ? !!this.courseSessionBooking.find(
          (csb) => csb.studentId === this.bookerId,
        )
      : undefined;
  }

  @Expose()
  @ApiPropertyOptional()
  get courseOutlineId() {
    return this.courseOutline?.id;
  }

  @Expose()
  @ApiPropertyOptional()
  get instructors() {
    return this.courseSessionInstructor?.map((csi) => ({
      id: csi.instructor.id,
      firstName: csi.instructor.firstName,
      lastName: csi.instructor.lastName,
      profileImageKey: csi.instructor.profileImageKey,
      email: csi.instructor.email,
    }));
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
    return this.courseOutline?.course?.userEnrolledCourse
      ? this.courseOutline.course.userEnrolledCourse.some(
          (uec) => uec.user.id === this.bookerId,
        )
      : undefined;
  }

  constructor(session: CourseSession, bookerId?: string) {
    super();
    Object.assign(this, session);
    this.bookerId = bookerId;
  }
}
