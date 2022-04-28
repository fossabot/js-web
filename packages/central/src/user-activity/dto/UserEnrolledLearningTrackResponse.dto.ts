import { ApiProperty } from '@nestjs/swagger';
import { UserEnrolledLearningTrack } from '@seaccentral/core/dist/learning-track/UserEnrolledLearningTrack.entity';
import { Exclude, Expose } from 'class-transformer';
import { flatten, uniq } from 'lodash';

@Exclude()
export class UserEnrolledLearningTrackResponse extends UserEnrolledLearningTrack {
  @Expose()
  @ApiProperty()
  username() {
    return this.user.username || this.user.email;
  }

  @Expose()
  @ApiProperty()
  firstName() {
    return this.user.firstName || '';
  }

  @Expose()
  @ApiProperty()
  lastName() {
    return this.user.lastName || '';
  }

  @Expose()
  @ApiProperty()
  email() {
    return this.user.email || '';
  }

  @Expose()
  @ApiProperty()
  isActivatedUser() {
    return this.user.isActivated;
  }

  @Expose()
  @ApiProperty()
  title() {
    return (
      this.learningTrack.title?.nameEn || this.learningTrack.title?.nameTh || ''
    );
  }

  @Expose()
  @ApiProperty()
  contentProvider() {
    const courseOutlines = this.getAllCourseOutlines();
    const providerNames = courseOutlines
      .map((it) => it.providerName)
      .filter((it) => !!it);
    return uniq(providerNames);
  }

  @Expose()
  @ApiProperty()
  enrolledDate() {
    return this.createdAt;
  }

  @Expose()
  @ApiProperty()
  learningProgress() {
    return 0;
  }

  @Expose()
  @ApiProperty()
  type() {
    return 'Learning Track';
  }

  @Expose()
  @ApiProperty()
  category() {
    return this.learningTrack.category.name;
  }

  @Expose()
  @ApiProperty()
  subCategories() {
    const courseOutlines = this.getAllCourseOutlines();
    const categoryNames = courseOutlines.map((it) => it.category.name);
    return uniq(categoryNames);
  }

  @Expose()
  @ApiProperty()
  learningWays() {
    const courseOutlines = this.getAllCourseOutlines();
    const learningWayNames = courseOutlines.map((it) => it.learningWay.name);
    return uniq(learningWayNames);
  }

  private getAllCourseOutlines() {
    const learningTrackSectionCourses = flatten(
      this.learningTrack.learningTrackSection.map(
        (it) => it.learningTrackSectionCourse,
      ),
    );
    const courses = flatten(learningTrackSectionCourses.map((it) => it.course));
    return flatten(courses.map((it) => it.courseOutline));
  }

  constructor(partial: Partial<UserEnrolledLearningTrack>) {
    super();
    Object.assign(this, partial);
  }
}
