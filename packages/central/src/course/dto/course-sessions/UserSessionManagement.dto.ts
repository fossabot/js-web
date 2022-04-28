import { User } from '@seaccentral/core/dist/user/User.entity';
import { Reason } from '@seaccentral/core/dist/course/UserCourseSessionCancellationLog.entity';
import { Exclude, Expose } from 'class-transformer';
import { OrganizationUser } from '@seaccentral/core/dist/organization/OrganizationUser.entity';
import { BaseEntityFullDto } from '@seaccentral/core/dist/dto/BaseEntity.dto';
import { CourseSessionBookingStatus } from '@seaccentral/core/dist/course/CourseSessionBooking.entity';
import { IRawActiveParticipants } from '../../interface/IRawActiveParticipants';
import { IRawUserCancellationLog } from '../../interface/IRawUserCancellationLog';

const isRawActiveUsers = (
  raw?: IRawActiveParticipants | IRawUserCancellationLog,
): raw is IRawActiveParticipants => {
  return (<IRawActiveParticipants>raw)?.booking_status !== undefined;
};

@Exclude()
export class UserSessionManagement extends BaseEntityFullDto {
  @Expose()
  subscriptionExpiryDate?: Date | null;

  @Expose()
  get organizationName() {
    return this.organizationUser?.[0]?.organization.name;
  }

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  email: string;

  @Expose()
  phoneNumber: string;

  @Exclude()
  organizationUser: OrganizationUser[];

  @Expose()
  cancelledReason?: Reason | null;

  @Expose()
  bookingStatus: CourseSessionBookingStatus =
    CourseSessionBookingStatus.CANCELLED;

  constructor(
    user: Partial<User>,
    raw?: IRawUserCancellationLog | IRawActiveParticipants,
  ) {
    super();
    Object.assign(this, user);
    this.subscriptionExpiryDate = raw?.expiryDate;

    if (isRawActiveUsers(raw)) {
      this.bookingStatus = raw.booking_status;
    } else {
      this.cancelledReason = raw?.usc_reason;
    }
  }
}
