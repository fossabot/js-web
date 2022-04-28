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
import { BANGKOK_TIMEZONE } from '@seaccentral/core/dist/utils/constants';
import { PushNotification } from '@seaccentral/core/dist/notification/PushNotification.entity';
import { NotificationVariableDict as NV } from '@seaccentral/core/dist/notification/NotificationVariableDict';
import { CourseRuleType } from '@seaccentral/core/dist/course/CourseRuleItem.entity';
import { CourseOutline } from '@seaccentral/core/dist/course/CourseOutline.entity';
import { CourseSession } from '@seaccentral/core/dist/course/CourseSession.entity';
import { UserCourseOutlineProgressStatus } from '@seaccentral/core/dist/course/UserCourseOutlineProgressStatus.enum';
import { BaseNotificationReminder } from './base.reminder';

@Injectable()
export class PreAssessmentReminder extends BaseNotificationReminder {
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
      PushNotificationSubCategoryKey.REMINDER_ASSESSMENT_RESULT_REQUIRED,
    );

    if (!notification || !triggerSeconds) return;

    const now = new Date();

    const bookings = await this.courseSessionBooking
      .createQueryBuilder('csb')
      .leftJoinAndSelect(
        'csb.courseSession',
        'session',
        'session.startDateTime >= :now AND session.cancelled = :cancelled',
      )
      .leftJoinAndSelect('session.courseOutline', 'outline')
      .leftJoinAndSelect('outline.title', 'title')
      .leftJoinAndSelect(
        'outline.courseRuleItems',
        'cri',
        'cri.type = :courseRuleItemType',
      )
      .leftJoinAndSelect('cri.appliedBy', 'appliedBy')
      .leftJoinAndSelect(
        'appliedBy.userCourseOutlineProgress',
        'outlineProgress',
      )
      .leftJoin('csb.student', 'student', 'student.isActivated = :isActivated')
      .where('csb.status = :status')
      .setParameters({
        isActive: true,
        now,
        isActivated: true,
        courseRuleItemType: CourseRuleType.PRE_ASSESSMENT,
        cancelled: false,
        status: CourseSessionBookingStatus.NO_MARK,
      })
      .getMany();

    const notifications: {
      session: CourseSession;
      assessment: CourseOutline;
      userId: string;
    }[] = [];

    super.generateNotificationsItems(
      bookings,
      triggerSeconds,
      now,
      (booking) => booking.courseSession.startDateTime,
      (booking) => {
        booking.courseSession.courseOutline.courseRuleItems.forEach(
          (ruleItem) => {
            if (
              !ruleItem.appliedBy.userCourseOutlineProgress.find(
                (progress) =>
                  progress.status === UserCourseOutlineProgressStatus.COMPLETED,
              )
            ) {
              notifications.push({
                userId: booking.studentId,
                session: booking.courseSession,
                assessment: ruleItem.appliedBy,
              });
            }
          },
        );
      },
    );

    await Promise.all(
      notifications.map((n) =>
        this.notificationProducer.notify(
          PushNotificationSubCategoryKey.REMINDER_ASSESSMENT_RESULT_REQUIRED,
          n.userId,
          {
            [NV.ASSESSMENT_NAME.alias]: n.assessment.assessmentName,
            [NV.SESSION_NAME.alias]: n.session.courseOutline.title,
          },
        ),
      ),
    );
  }
}
