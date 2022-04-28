/* eslint-disable max-classes-per-file */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';

import { Course } from '@seaccentral/core/dist/course/Course.entity';
import { CourseTag } from '@seaccentral/core/dist/course/CourseTag.entity';
import { CourseTopic } from '@seaccentral/core/dist/course/CourseTopic.entity';
import { CourseOutline } from '@seaccentral/core/dist/course/CourseOutline.entity';
import { CourseSession } from '@seaccentral/core/dist/course/CourseSession.entity';
import { CourseCategory } from '@seaccentral/core/dist/course/CourseCategory.entity';
import { CourseMaterial } from '@seaccentral/core/dist/course/CourseMaterial.entity';
import { CourseSessionInstructor } from '@seaccentral/core/dist/course/CourseSessionInstructor.entity';
import {
  getStringFromLanguage,
  transformLanguage,
} from '@seaccentral/core/dist/utils/language';
import {
  Language,
  LanguageCode,
} from '@seaccentral/core/dist/language/Language.entity';
import { CourseSessionBooking } from '@seaccentral/core/dist/course/CourseSessionBooking.entity';
import { flatten, uniqBy } from 'lodash';

class CourseSessionResponseDto extends CourseSession {
  @Expose()
  @ApiProperty()
  get instructorsIds() {
    return this.courseSessionInstructor?.map((csi) => csi.instructor.id);
  }

  @Expose()
  @ApiProperty()
  get instructors() {
    return (
      this.courseSessionInstructor?.map((csi) => ({
        id: csi.instructor.id,
        email: csi.instructor.email,
        lastName: csi.instructor.lastName,
        firstName: csi.instructor.firstName,
        profileImageKey: csi.instructor.profileImageKey,
      })) || []
    );
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

  @Exclude()
  courseSessionBooking: CourseSessionBooking[];

  constructor(partial: Partial<CourseSession>) {
    super();
    Object.assign(this, partial);
  }
}

export class CourseOutlineResponseDto extends CourseOutline {
  @Expose()
  @ApiProperty()
  @Transform(transformLanguage)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  title: Language;

  @Expose()
  @ApiPropertyOptional()
  @Transform(transformLanguage)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  description?: Language;

  @Expose()
  @ApiProperty()
  @Transform(transformLanguage)
  get categoryId() {
    return this.category?.id;
  }

  @Expose()
  @ApiProperty()
  get learningWayId() {
    return this.learningWay?.id;
  }

  @Expose()
  @ApiProperty()
  get organizationId() {
    return this.organizationProvider?.id;
  }

  @Expose()
  @ApiProperty()
  get learningContentFileId() {
    return this.learningContentFile?.id;
  }

  @Expose()
  @ApiProperty()
  get courseSessions() {
    return this.courseSession?.map((cs) => new CourseSessionResponseDto(cs));
  }

  @Exclude()
  courseSession: CourseSession[];

  constructor(courseOutline: Partial<CourseOutline>) {
    super();
    Object.assign(this, courseOutline);
  }
}

export class TranslatedCourseOutlineResponseDto extends CourseOutlineResponseDto {
  @Expose()
  @ApiProperty()
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  title: string;

  @Expose()
  @ApiPropertyOptional()
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  description?: string;

  @Exclude()
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  courseSessions: CourseSessionResponseDto[];

  @Expose()
  @ApiPropertyOptional()
  get instructors() {
    return uniqBy(
      flatten(
        this.courseSession?.map((session) =>
          session.courseSessionInstructor.map((csi) => ({
            id: csi.instructor.id,
            email: csi.instructor.email,
            lastName: csi.instructor.lastName,
            firstName: csi.instructor.firstName,
            profileImageKey: csi.instructor.profileImageKey,
          })),
        ) || [],
      ),
      (instructor) => instructor.id,
    ).slice(0, 5);
  }

  @Expose()
  @ApiPropertyOptional()
  get totalSessionsBooked() {
    return this.courseSession?.filter(
      (session) => session.courseSessionBooking.length > 0,
    ).length;
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

  constructor(courseOutline: Partial<CourseOutline>, langCode: LanguageCode) {
    super(courseOutline);
    if (courseOutline.course && courseOutline.course.title) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.course.title = getStringFromLanguage(
        courseOutline.course.title,
        langCode,
      );
    }
    this.title = getStringFromLanguage(courseOutline.title, langCode);
    this.description = getStringFromLanguage(
      courseOutline.description,
      langCode,
    );
  }
}

export class CourseResponseDto extends Course {
  @Expose()
  @ApiProperty()
  @Transform(transformLanguage)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  title: Language;

  @Expose()
  @ApiPropertyOptional()
  @Transform(transformLanguage)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  tagLine?: Language;

  @Expose()
  @ApiPropertyOptional()
  @Transform(transformLanguage)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  description?: Language;

  @Expose()
  @ApiPropertyOptional()
  @Transform(transformLanguage)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  courseTarget?: Language;

  @Expose()
  @ApiPropertyOptional()
  @Transform(transformLanguage)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  learningObjective?: Language;

  @Expose()
  @ApiProperty()
  get tags() {
    return (
      this.courseTag?.filter((ct) => !!ct.tag?.id).map((ct) => ct.tag) || []
    );
  }

  @Expose()
  @ApiProperty()
  get materials() {
    return (
      this.courseMaterial
        ?.filter((cm) => !!cm.material?.id)
        .map((cm) => cm.material) || []
    );
  }

  @Expose()
  @ApiProperty()
  get topics() {
    return (
      this.courseTopic?.filter((ct) => !!ct.topic?.id).map((ct) => ct.topic) ||
      []
    );
  }

  @Expose()
  @ApiProperty()
  get tagIds() {
    return (
      this.courseTag?.filter((ct) => !!ct.tag?.id).map((ct) => ct.tag.id) || []
    );
  }

  @Expose()
  @ApiProperty()
  get materialIds() {
    return (
      this.courseMaterial
        ?.filter((cm) => !!cm.material?.id)
        .map((cm) => cm.material.id) || []
    );
  }

  @Expose()
  @ApiProperty()
  get topicIds() {
    return (
      this.courseTopic
        ?.filter((ct) => !!ct.topic?.id)
        .map((ct) => ct.topic.id) || []
    );
  }

  @Expose()
  @ApiProperty()
  get categoryId() {
    return this.category?.id;
  }

  @Expose()
  @ApiProperty()
  get courseOutlines():
    | CourseOutlineResponseDto[]
    | TranslatedCourseOutlineResponseDto[] {
    return this.courseOutline?.map((co) => new CourseOutlineResponseDto(co));
  }

  @Exclude()
  courseOutline: CourseOutline[];

  @Expose()
  category: CourseCategory;

  @Exclude()
  courseTag: CourseTag[];

  @Exclude()
  courseMaterial: CourseMaterial[];

  @Exclude()
  courseTopic: CourseTopic[];

  constructor(course: Partial<Course>) {
    super();
    Object.assign(this, course);
  }
}

export class TranslatedCourseResponseDto extends CourseResponseDto {
  private langCode: LanguageCode = LanguageCode.EN;

  @Expose()
  @ApiProperty()
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  title: string;

  @Expose()
  @ApiPropertyOptional()
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  tagLine?: string;

  @Expose()
  @ApiPropertyOptional()
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  description?: string;

  @Expose()
  @ApiPropertyOptional()
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  courseTarget?: string;

  @Expose()
  @ApiPropertyOptional()
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  learningObjective?: string;

  @Expose()
  @ApiProperty()
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  get courseOutlines() {
    return this.courseOutline?.map(
      (co) => new TranslatedCourseOutlineResponseDto(co, this.langCode),
    );
  }

  constructor(course: Partial<Course>, langCode: LanguageCode) {
    super(course);
    this.langCode = langCode;
    this.title = getStringFromLanguage(course.title, langCode);
    this.tagLine = getStringFromLanguage(course.tagLine, langCode);
    this.description = getStringFromLanguage(course.description, langCode);
    this.courseTarget = getStringFromLanguage(course.courseTarget, langCode);
    this.learningObjective = getStringFromLanguage(
      course.learningObjective,
      langCode,
    );
  }
}
