import { ApiProperty } from '@nestjs/swagger';
import { CourseSession } from '@seaccentral/core/dist/course/CourseSession.entity';
import { CourseSessionBooking } from '@seaccentral/core/dist/course/CourseSessionBooking.entity';
import { Exclude, Expose } from 'class-transformer';
import { omit } from 'lodash';

export class CourseSessionBookingResponse {
  @Expose()
  @ApiProperty()
  get courseId() {
    return this.courseSession.courseOutline.courseId;
  }

  @Expose()
  @ApiProperty()
  get outline() {
    const outline = { ...this.courseSession.courseOutline };
    return omit(outline, 'courseId');
  }

  @Expose()
  @ApiProperty()
  get session() {
    return {
      id: this.courseSession.id,
      isActive: this.courseSession.isActive,
      isPrivate: this.courseSession.isPrivate,
      createdAt: this.courseSession.createdAt,
      updatedAt: this.courseSession.updatedAt,
      seats: this.courseSession.seats,
      webinarTool: this.courseSession.webinarTool,
      participantUrl: this.courseSession.participantUrl,
      location: this.courseSession.location,
      startDateTime: this.courseSession.startDateTime,
      endDateTime: this.courseSession.endDateTime,
      language: this.courseSession.language,
      instructors: this.courseSession.courseSessionInstructor.map((csi) => ({
        id: csi.instructor.id,
        firstName: csi.instructor.firstName,
        lastName: csi.instructor.lastName,
        email: csi.instructor.email,
        profileImageKey: csi.instructor.profileImageKey,
      })),
    };
  }

  @Exclude()
  courseSession: CourseSession;

  preRequisiteCourseId?: string;

  constructor(
    partial: Partial<CourseSessionBooking>,
    preRequisiteCourseId?: string,
  ) {
    Object.assign(this, partial);
    this.preRequisiteCourseId = preRequisiteCourseId;
  }
}
