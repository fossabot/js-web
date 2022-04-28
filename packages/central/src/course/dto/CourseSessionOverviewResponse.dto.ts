import { Exclude, Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { getStringFromLanguage } from '@seaccentral/core/dist/utils/language';
import { LanguageCode } from '@seaccentral/core/dist/language/Language.entity';
import { CourseSession } from '@seaccentral/core/dist/course/CourseSession.entity';
import { CourseLanguage } from '@seaccentral/core/dist/course/courseLanguage.enum';

@Exclude()
export class CourseSessionOverviewResponse extends CourseSession {
  private langCode: LanguageCode = LanguageCode.EN;

  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  isPrivate: boolean;

  @Expose()
  @ApiProperty()
  instructorId() {
    if (!this.courseSessionInstructor?.length) return '';

    return this.courseSessionInstructor[0].instructor.id;
  }

  @Expose()
  @ApiProperty()
  courseId() {
    return this.courseOutline.course.id;
  }

  @Expose()
  @ApiProperty()
  courseTitle() {
    return getStringFromLanguage(
      this.courseOutline.course.title,
      this.langCode,
    );
  }

  @Expose()
  @ApiProperty()
  courseImageKey() {
    return this.courseOutline.course.imageKey;
  }

  @Expose()
  @ApiProperty()
  courseLanguage() {
    return this.courseOutline.course.availableLanguage;
  }

  @Expose()
  @ApiProperty()
  courseOutlineId() {
    return this.courseOutline.id;
  }

  @Expose()
  @ApiProperty()
  booked() {
    return this.courseSessionBooking?.length || 0;
  }

  @Expose()
  @ApiProperty()
  instructorName() {
    if (!this.courseSessionInstructor?.length) return '';

    const { instructor } = this.courseSessionInstructor[0];
    return `${instructor.firstName} ${instructor.lastName}`.trim();
  }

  @Expose()
  @ApiPropertyOptional()
  courseSubCategoryKey() {
    return this.courseOutline?.category?.key;
  }

  @Expose()
  @ApiProperty()
  seats: number;

  @Expose()
  @ApiProperty()
  location?: string;

  @Expose()
  @ApiProperty()
  sessionStatus() {
    return this.status;
  }

  @Expose()
  @ApiProperty()
  startDateTime: Date;

  @Expose()
  @ApiProperty()
  endDateTime: Date;

  @Expose()
  @ApiPropertyOptional()
  participantUrl?: string | null | undefined;

  @Expose()
  @ApiPropertyOptional()
  webinarTool?: string | null | undefined;

  @Expose()
  @ApiProperty()
  language: CourseLanguage;

  constructor(partial: Partial<CourseSession>, langCode: LanguageCode) {
    super();
    Object.assign(this, partial);
    this.langCode = langCode;
  }
}
