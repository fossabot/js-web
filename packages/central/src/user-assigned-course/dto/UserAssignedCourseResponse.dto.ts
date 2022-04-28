import { ApiProperty } from '@nestjs/swagger';
import { Expose, Exclude, Transform } from 'class-transformer';

import { User } from '@seaccentral/core/dist/user/User.entity';
import { Course } from '@seaccentral/core/dist/course/Course.entity';
import { LanguageCode } from '@seaccentral/core/dist/language/Language.entity';
import {
  UserAssignedCourse,
  UserAssignedCourseType,
} from '@seaccentral/core/dist/course/UserAssignedCourse.entity';
import { getStringFromLanguage } from '@seaccentral/core/dist/utils/language';

@Exclude()
export class UserAssignedCourseResponseDto extends UserAssignedCourse {
  private langCode: LanguageCode = LanguageCode.EN;

  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  dueDateTime: Date | null;

  @Expose()
  @ApiProperty()
  assignmentType: UserAssignedCourseType;

  @Expose()
  @ApiProperty()
  @Transform(({ value }: { value: User }) => ({
    id: value.id,
    email: value.email,
    firstName: value.firstName,
    lastName: value.lastName,
  }))
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  user: Partial<User>;

  @Expose()
  @ApiProperty()
  @Transform(
    ({ value, obj }: { value: Course; obj: { langCode: LanguageCode } }) => ({
      id: value.id,
      title: getStringFromLanguage(value.title, obj.langCode),
    }),
  )
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  course: Partial<Course>;

  @Expose()
  @ApiProperty()
  groupName() {
    return this.user.groupUser?.[0]?.group?.name;
  }

  @Expose()
  @ApiProperty()
  organizationName() {
    return this.user.organizationUser?.[0]?.organization?.name;
  }

  constructor(
    userAssignedCourse: Partial<UserAssignedCourse>,
    langCode: LanguageCode,
  ) {
    super();
    Object.assign(this, userAssignedCourse);
    this.langCode = langCode;
  }
}
