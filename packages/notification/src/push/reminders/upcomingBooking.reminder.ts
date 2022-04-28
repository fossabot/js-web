import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationProducer } from '@seaccentral/core/dist/queue/notification.producer';
import { PushNotificationSubCategoryKey } from '@seaccentral/core/dist/notification/enum/PushNotificationSubCategory.enum';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CourseSessionBooking,
  CourseSessionBookingStatus,
} from '@seaccentral/core/dist/course/CourseSessionBooking.entity';
import { Repository } from 'typeorm';
import {
  BANGKOK_TIMEZONE,
  NOTIFICATION_DATE_FORMAT,
} from '@seaccentral/core/dist/utils/constants';
import { PushNotification } from '@seaccentral/core/dist/notification/PushNotification.entity';
import { NotificationVariableDict as NV } from '@seaccentral/core/dist/notification/NotificationVariableDict';
import { getLanguageFromDate } from '@seaccentral/core/dist/utils/language';
import { BaseNotificationReminder } from './base.reminder';

@Injectable()
export class UpcomingBookingReminder extends BaseNotificationReminder {
  constructor(
    private readonly notificationProducer: NotificationProducer,
    @InjectRepository(CourseSessionBooking)
    private readonly courseSessionBooking: Repository<CourseSessionBooking>,
    @InjectRepository(PushNotification)
    private readonly pushNotification: Repository<PushNotification>,
  ) {
    super(pushNotification);
  }

  @Cron(CronExpression.EVERY_DAY_AT_7AM, { timeZone: BANGKOK_TIMEZONE })
  async execute() {
    const { notification, triggerSeconds } = await super.getPushNotification(
      PushNotificationSubCategoryKey.REMINDER_UPCOMING_BOOKED_EVENTS,
    );

    if (!notification || !triggerSeconds) return;

    const now = new Date();

    const bookings = await this.courseSessionBooking
      .createQueryBuilder('csb')
      .innerJoinAndSelect(
        'csb.courseSession',
        'session',
        'session.cancelled = :cancelled AND session.startDateTime >= :now',
      )
      .innerJoinAndSelect('session.courseOutline', 'outline')
      .innerJoinAndSelect('outline.title', 'title')
      .innerJoin('csb.student', 'user', 'user.isActivated = :isActivated')
      .where('csb.status = :status')
      .setParameters({
        cancelled: false,
        status: CourseSessionBookingStatus.NO_MARK,
        now,
        isActivated: true,
      })
      .getMany();

    const notifications: { booking: CourseSessionBooking; userId: string }[] =
      [];

    super.generateNotificationsItems(
      bookings,
      triggerSeconds,
      now,
      (booking) => booking.courseSession.startDateTime,
      (booking) => notifications.push({ booking, userId: booking.studentId }),
    );

    await Promise.all(
      notifications.map((n) => {
        const startDateTime = getLanguageFromDate(
          n.booking.courseSession.startDateTime,
          NOTIFICATION_DATE_FORMAT,
        );

        const endDateTime = getLanguageFromDate(
          n.booking.courseSession.endDateTime,
          NOTIFICATION_DATE_FORMAT,
        );

        return this.notificationProducer.notify(
          PushNotificationSubCategoryKey.REMINDER_UPCOMING_BOOKED_EVENTS,
          n.userId,
          {
            [NV.SESSION_NAME.alias]:
              n.booking.courseSession.courseOutline.title,
            [NV.SESSION_START_DATETIME.alias]: startDateTime,
            [NV.SESSION_END_DATETIME.alias]: endDateTime,
          },
        );
      }),
    );
  }
}
