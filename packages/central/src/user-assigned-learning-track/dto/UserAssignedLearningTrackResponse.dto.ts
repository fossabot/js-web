import { ApiProperty } from '@nestjs/swagger';
import { Expose, Exclude, Transform } from 'class-transformer';

import { User } from '@seaccentral/core/dist/user/User.entity';
import { getStringFromLanguage } from '@seaccentral/core/dist/utils/language';
import { LanguageCode } from '@seaccentral/core/dist/language/Language.entity';
import { LearningTrack } from '@seaccentral/core/dist/learning-track/LearningTrack.entity';
import {
  UserAssignedLearningTrack,
  UserAssignedLearningTrackType,
} from '@seaccentral/core/dist/learning-track/UserAssignedLearningTrack.entity';

@Exclude()
export class UserAssignedLearningTrackResponseDto extends UserAssignedLearningTrack {
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
  assignmentType: UserAssignedLearningTrackType;

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
    ({
      value,
      obj,
    }: {
      value: LearningTrack;
      obj: { langCode: LanguageCode };
    }) => ({
      id: value.id,
      title: getStringFromLanguage(value.title, obj.langCode),
    }),
  )
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  learningTrack: Partial<LearningTrack>;

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
    userAssignedLearningTrack: Partial<UserAssignedLearningTrack>,
    langCode: LanguageCode,
  ) {
    super();
    Object.assign(this, userAssignedLearningTrack);
    this.langCode = langCode;
  }
}
