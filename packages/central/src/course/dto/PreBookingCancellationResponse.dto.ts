// eslint-disable-next-line max-classes-per-file
import { ApiProperty } from '@nestjs/swagger';
import { CourseSession } from '@seaccentral/core/dist/course/CourseSession.entity';
import { Exclude, Expose } from 'class-transformer';
import { pick } from 'lodash';

@Exclude()
class RelatedCourseSessionBookings extends CourseSession {
  @Expose()
  @ApiProperty()
  get outline() {
    const outline = { ...this.courseOutline };
    return pick(outline, ['title']);
  }

  @Expose()
  get sessionId() {
    return this.id;
  }

  constructor(partial: Partial<CourseSession>) {
    super();
    Object.assign(this, partial);
  }
}
@Exclude()
export class PreBookingCancellationResponse {
  private readonly toRemoveCourseSessions: Partial<CourseSession>[] = [];

  private readonly courseSession: Partial<CourseSession>;

  @Expose()
  get course() {
    return { imageKey: this.courseSession?.courseOutline?.course?.imageKey };
  }

  @Expose()
  get relatedBookings() {
    return this.toRemoveCourseSessions.map(
      (cs: Partial<CourseSession>) => new RelatedCourseSessionBookings(cs),
    );
  }

  constructor(cs: Partial<CourseSession>, trcs: Partial<CourseSession>[]) {
    this.courseSession = cs;
    this.toRemoveCourseSessions = trcs;
  }
}
