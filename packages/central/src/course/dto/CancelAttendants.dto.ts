import { ApiProperty } from '@nestjs/swagger';
import { Subscription } from '@seaccentral/core/dist/payment/Subscription.entity';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { Reason } from '@seaccentral/core/dist/course/UserCourseSessionCancellationLog.entity';
import { Exclude, Expose } from 'class-transformer';

export class CancelAttendantsDto {
  @Exclude()
  subscription?: Subscription;

  @Expose()
  @ApiProperty()
  get latestSubscriptionByOutline(): Partial<Subscription> | undefined {
    if (!this.subscription) {
      return undefined;
    }
    return this.subscription;
  }

  constructor(
    private readonly attendant: User,
    private readonly reason?: Reason,
    subscription?: Subscription,
  ) {
    this.subscription = subscription;
  }
}
