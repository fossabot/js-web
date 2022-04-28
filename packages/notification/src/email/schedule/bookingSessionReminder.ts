import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseSessionBooking } from '@seaccentral/core/dist/course/CourseSessionBooking.entity';
import { CourseSubCategoryKey } from '@seaccentral/core/dist/course/CourseSubCategory.entity';
import { EmailNotification } from '@seaccentral/core/dist/notification/EmailNotification.entity';
import { EmailNotificationSubCategoryKey } from '@seaccentral/core/dist/notification/enum/EmailNotificationSubCategory.enum';
import { NotificationVariableDict } from '@seaccentral/core/dist/notification/NotificationVariableDict';
import { NotificationProducer } from '@seaccentral/core/dist/queue/notification.producer';
import { BANGKOK_TIMEZONE } from '@seaccentral/core/dist/utils/constants';
import { formatWithTimezone } from '@seaccentral/core/dist/utils/date';
import { getStringFromLanguage } from '@seaccentral/core/dist/utils/language';
import { addSeconds, differenceInDays, isBefore } from 'date-fns';
import { Repository } from 'typeorm';
import { BaseReminder } from './baseReminder';

@Injectable()
export class BookingSessionReminder extends BaseReminder {
  constructor(
    @InjectRepository(EmailNotification)
    emailNotificationRepository: Repository<EmailNotification>,
    @InjectRepository(CourseSessionBooking)
    private readonly courseSessionBookingRepository: Repository<CourseSessionBooking>,
    notificationProducer: NotificationProducer,
    private readonly configService: ConfigService,
  ) {
    super(emailNotificationRepository, notificationProducer);
  }

  @Cron(CronExpression.EVERY_DAY_AT_5AM, {
    timeZone: BANGKOK_TIMEZONE,
  })
  async execute() {
    const emailNotif = await super.getEmailNotification(
      EmailNotificationSubCategoryKey.REMINDER_BOOK_SESSION_F2F,
    );

    if (!emailNotif) return;

    const now = new Date();

    const bookings = await this.courseSessionBookingRepository
      .createQueryBuilder('courseSessionBooking')
      .leftJoinAndSelect('courseSessionBooking.courseSession', 'session')
      .leftJoinAndSelect('courseSessionBooking.student', 'student')
      .leftJoinAndSelect('session.courseOutline', 'courseOutline')
      .leftJoinAndSelect(
        'session.courseSessionInstructor',
        'courseSessionInstructor',
      )
      .leftJoinAndSelect('courseSessionInstructor.instructor', 'instructor')
      .leftJoinAndSelect('courseOutline.title', 'courseOutlineTitle')
      .leftJoinAndSelect('courseOutline.category', 'category')
      .where('student.isActive = :isActive')
      .andWhere('session.startDateTime > :now')
      .andWhere('session.isActive = :isActive')
      .andWhere('session.cancelled = :cancelled')
      .setParameters({
        isActive: true,
        now,
        cancelled: false,
      })
      .getMany();

    const recipients: CourseSessionBooking[] = [];

    bookings.forEach((booking) => {
      emailNotif.triggerType.triggerSeconds.forEach((seconds) => {
        const sendDate = addSeconds(
          booking.courseSession.startDateTime,
          seconds,
        );

        if (isBefore(now, sendDate) && differenceInDays(now, sendDate) === 0) {
          recipients.push(booking);
        }
      });
    });

    recipients.forEach((booking) => {
      if (booking.student.email) {
        super.enqueueEmail({
          key:
            booking.courseSession.courseOutline.category.key ===
            CourseSubCategoryKey.FACE_TO_FACE
              ? EmailNotificationSubCategoryKey.REMINDER_BOOK_SESSION_F2F
              : EmailNotificationSubCategoryKey.REMINDER_BOOK_SESSION_VIRTUAL,
          language: booking.student.emailNotificationLanguage,
          to: booking.student.email,
          replacements: {
            [NotificationVariableDict.FULL_NAME.alias]:
              booking.student.fullName,
            [NotificationVariableDict.SESSION_NAME.alias]:
              getStringFromLanguage(
                booking.courseSession.courseOutline.title,
                booking.student.emailNotificationLanguage,
              ),
            [NotificationVariableDict.SESSION_START_DATE.alias]:
              formatWithTimezone(
                booking.courseSession.startDateTime,
                BANGKOK_TIMEZONE,
                'dd MMM yyyy',
              ),
            [NotificationVariableDict.SESSION_START_DATETIME.alias]:
              formatWithTimezone(
                booking.courseSession.startDateTime,
                BANGKOK_TIMEZONE,
                'dd MMM yyyy HH:mm',
              ),
            [NotificationVariableDict.SESSION_END_DATETIME.alias]:
              formatWithTimezone(
                booking.courseSession.endDateTime,
                BANGKOK_TIMEZONE,
                'dd MMM yyyy HH:mm',
              ),
            [NotificationVariableDict.INSTRUCTOR_NAME.alias]:
              booking.courseSession.courseSessionInstructor?.[0]?.instructor
                ?.fullName,
            [NotificationVariableDict.SESSION_WAITING_ROOM_LINK
              .alias]: `${this.configService.get(
              'WEB_URL',
            )}/dashboard/bookings/${booking.id}`,
            [NotificationVariableDict.LOCATION_NAME.alias]:
              booking.courseSession.location,
            [NotificationVariableDict.COURSE_DETAIL_LINK
              .alias]: `${this.configService.get('WEB_URL')}/course-detail/${
              booking.courseSession.courseOutline.courseId
            }`,
          },
        });
      }
    });
  }
}
