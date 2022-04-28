import { ApiProperty } from '@nestjs/swagger';
import { UserEnrolledCourse } from '@seaccentral/core/dist/course/UserEnrolledCourse.entity';
import { CourseSubCategoryKey } from '@seaccentral/core/dist/course/CourseSubCategory.entity';
import { Exclude, Expose } from 'class-transformer';
import { uniq } from 'lodash';

@Exclude()
export class UserEnrolledCourseResponse extends UserEnrolledCourse {
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
    return this.course.title?.nameEn || this.course.title?.nameTh || '';
  }

  @Expose()
  @ApiProperty()
  contentProvider() {
    const providerNames = this.course.courseOutline
      .filter((it) => it.category.key === CourseSubCategoryKey.LINK)
      .map((it) => it.providerName);
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
    return this.percentage;
  }

  @Expose()
  @ApiProperty()
  type() {
    return 'Course';
  }

  @Expose()
  @ApiProperty()
  category() {
    return this.course.category.name;
  }

  @Expose()
  @ApiProperty()
  subCategories() {
    if (!this.course.courseOutline.length) return '';

    return uniq(this.course.courseOutline.map((co) => co.category.name));
  }

  @Expose()
  @ApiProperty()
  learningWays() {
    if (!this.course.courseOutline.length) return '';

    return uniq(this.course.courseOutline.map((co) => co.learningWay.name));
  }

  constructor(partial: Partial<UserEnrolledCourse>) {
    super();
    Object.assign(this, partial);
  }
}
