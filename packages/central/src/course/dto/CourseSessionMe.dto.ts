import { ApiProperty } from '@nestjs/swagger';
import { CourseSession } from '@seaccentral/core/dist/course/CourseSession.entity';
import { CourseSessionInstructor } from '@seaccentral/core/dist/course/CourseSessionInstructor.entity';
import { LanguageCode } from '@seaccentral/core/dist/language/Language.entity';
import { Exclude, Expose } from 'class-transformer';
import { TranslatedCourseOutlineResponseDto } from './CourseResponse.dto';

export class CourseSessionMe extends CourseSession {
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
  get sessionBookings() {
    return this.courseSessionBooking?.map((sb) => ({
      id: sb.id,
      userId: sb.studentId,
      sessionId: sb.courseSessionId,
    }));
  }

  @Exclude()
  courseSessionInstructor: CourseSessionInstructor[];

  constructor(partial: Partial<CourseSession>, langCode: LanguageCode) {
    super();

    Object.assign(this, {
      ...partial,
      courseOutline: new TranslatedCourseOutlineResponseDto(
        { ...partial.courseOutline },
        langCode,
      ),
    });
  }
}
