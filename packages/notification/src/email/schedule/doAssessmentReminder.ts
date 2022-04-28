import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseOutline } from '@seaccentral/core/dist/course/CourseOutline.entity';
import { CourseRuleType } from '@seaccentral/core/dist/course/CourseRuleItem.entity';
import { CourseSessionBooking } from '@seaccentral/core/dist/course/CourseSessionBooking.entity';
import { UserCourseOutlineProgressStatus } from '@seaccentral/core/dist/course/UserCourseOutlineProgressStatus.enum';
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
export class DoAssessmentReminder extends BaseReminder {
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

  @Cron(CronExpression.EVERY_DAY_AT_2AM, {
    timeZone: BANGKOK_TIMEZONE,
  })
  async execute() {
    const emailNotif = await super.getEmailNotification(
      EmailNotificationSubCategoryKey.REMINDER_TODO_ASSESSMENT,
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
      .leftJoinAndSelect('courseOutline.courseRuleItems', 'courseRuleItems')
      .leftJoinAndSelect('courseRuleItems.appliedBy', 'appliedBy')
      .leftJoinAndSelect(
        'appliedBy.userCourseOutlineProgress',
        'outlineProgress',
      )
      .where('student.isActive = :isActive')
      .andWhere('session.startDateTime > :now')
      .andWhere('session.isActive = :isActive')
      .andWhere('courseRuleItems.type = :courseRuleItemType')
      .setParameters({
        isActive: true,
        now,
        courseRuleItemType: CourseRuleType.PRE_ASSESSMENT,
      })
      .getMany();

    const recipients: {
      booking: CourseSessionBooking;
      assessment: CourseOutline;
    }[] = [];

    bookings.forEach((booking) => {
      emailNotif.triggerType.triggerSeconds.forEach((seconds) => {
        const sendDate = addSeconds(
          booking.courseSession.startDateTime,
          seconds,
        );

        if (isBefore(now, sendDate) && differenceInDays(now, sendDate) === 0) {
          booking.courseSession.courseOutline.courseRuleItems.forEach(
            (ruleItem) => {
              // if pre-assessment course outline is not finished yet
              if (
                !ruleItem.appliedBy.userCourseOutlineProgress.find(
                  (progress) =>
                    progress.status ===
                    UserCourseOutlineProgressStatus.COMPLETED,
                )
              ) {
                recipients.push({ booking, assessment: ruleItem.appliedBy });
              }
            },
          );
        }
      });
    });

    recipients.forEach(({ assessment, booking }) => {
      if (booking.student.email) {
        super.enqueueEmail({
          key: EmailNotificationSubCategoryKey.REMINDER_TODO_ASSESSMENT,
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
            [NotificationVariableDict.ASSESSMENT_LINK
              .alias]: `${this.configService.get('WEB_URL')}/course-detail/${
              assessment.id
            }`,
          },
        });
      }
    });
  }
}
