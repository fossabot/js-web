import { ApiProperty } from '@nestjs/swagger';
import { UserEmailNotification } from '@seaccentral/core/dist/notification/UserEmailNotification.entity';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class GetUserEmailNotificationResponseDto extends UserEmailNotification {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  subject: string;

  @Expose()
  @ApiProperty()
  html: string;

  @Expose()
  @ApiProperty()
  text: string;

  @Expose()
  @ApiProperty()
  category: string;

  @Expose()
  @ApiProperty()
  from: string;

  @Expose()
  @ApiProperty()
  awsMessageId: string;

  @Expose()
  @ApiProperty()
  @Transform(({ value }: { value: User }) => ({
    id: value.id,
    email: value.email,
  }))
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  user: Partial<User>;

  @Expose()
  @ApiProperty()
  organizationName() {
    return this.user.organizationUser?.[0]?.organization?.name;
  }

  constructor(userEmailNotification: Partial<UserEmailNotification>) {
    super();
    Object.assign(this, userEmailNotification);
  }
}
