import { groupBy } from 'lodash';
import { IsNull, LessThanOrEqual, MoreThan, Not, Repository } from 'typeorm';
import { differenceInDays, addDays } from 'date-fns';

import { InjectRepository } from '@nestjs/typeorm';
import { EmailNotification } from '@seaccentral/core/dist/notification/EmailNotification.entity';
import { EmailNotificationSubCategoryKey } from '@seaccentral/core/dist/notification/enum/EmailNotificationSubCategory.enum';
import {
  BANGKOK_TIMEZONE,
  DEFAULT_TIMEZONE,
} from '@seaccentral/core/dist/utils/constants';
import { NotificationVariableDict } from '@seaccentral/core/dist/notification/NotificationVariableDict';
import { formatWithTimezone } from '@seaccentral/core/dist/utils/date';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { Subscription } from '@seaccentral/core/dist/payment/Subscription.entity';
import { NotificationProducer } from '@seaccentral/core/dist/queue/notification.producer';
import { getStringFromLanguage } from '@seaccentral/core/dist/utils/language';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  UserAssignedCourse,
  UserAssignedCourseType,
} from '@seaccentral/core/dist/course/UserAssignedCourse.entity';

import { generateHtmlList } from '@seaccentral/core/dist/utils/email';
import { BaseReminder } from './baseReminder';

/**
 * Send email to users who either
 * Have required course and it's about to be due
 * OR
 * Have required course and subscription is about to expire
 */
@Injectable()
export class CompleteRequiredCourseReminder extends BaseReminder {
  constructor(
    @InjectRepository(EmailNotification)
    emailNotificationRepository: Repository<EmailNotification>,
    notificationProducer: NotificationProducer,
    @InjectRepository(UserAssignedCourse)
    private readonly userAssignedCourseRepository: Repository<UserAssignedCourse>,
    private readonly configService: ConfigService,
  ) {
    super(emailNotificationRepository, notificationProducer);
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM, {
    timeZone: BANGKOK_TIMEZONE,
  })
  async execute(): Promise<void> {
    const emailNotif = await super.getEmailNotification(
      EmailNotificationSubCategoryKey.REMINDER_COMPLETE_ASSIGNED_COURSE,
    );

    if (!emailNotif) return;

    const now = new Date();
    const reminderDays = super.getReminderDays(
      now,
      emailNotif.triggerType.triggerSeconds,
    );

    const nextFarthestDays = addDays(now, reminderDays[0]);

    const userAssignedCourseList = await this.userAssignedCourseRepository.find(
      {
        where: {
          dueDateTime:
            Not(IsNull()) && LessThanOrEqual(nextFarthestDays) && MoreThan(now),
          assignmentType: UserAssignedCourseType.Required,
        },
        relations: ['user', 'user.subscriptions', 'course', 'course.title'],
      },
    );

    const emailUsers = userAssignedCourseList.filter((uac) => {
      const diff = differenceInDays(uac.dueDateTime || now, now);
      return reminderDays.includes(diff);
    });

    const sentUsers: string[] = [];
    if (emailUsers.length > 0) {
      const grouped = groupBy(emailUsers, (x) => x.userId);

      Object.keys(grouped).forEach((userId) =>
        this.constructAndSendEmail(now, grouped[userId], sentUsers),
      );
    }

    const query = await this.userAssignedCourseRepository
      .createQueryBuilder('uac')
      .leftJoinAndSelect('uac.user', 'user')
      .leftJoinAndSelect('user.subscriptions', 'subscription')
      .where('user.isActive = :isActive')
      .andWhere('subscription.endDate <= :nextFarthestDays')
      .andWhere('subscription.endDate > :now')
      .andWhere('subscription.isActive = :isActive')
      .andWhere('subscription.autoRenew = :autoRenew')
      .andWhere('user.email IS NOT NULL')
      .setParameters({
        now,
        nextFarthestDays,
        autoRenew: false,
        isActive: true,
      })
      .getMany();

    const nearlyExpiredSubUsers = query.filter(
      (x) => !sentUsers.includes(x.userId),
    );
    if (!nearlyExpiredSubUsers || nearlyExpiredSubUsers.length < 1) return;

    const grouped = groupBy(nearlyExpiredSubUsers, (x) => x.userId);
    Object.keys(grouped).forEach((userId) => {
      this.constructAndSendEmail(now, grouped[userId], sentUsers);
    });
  }

  private constructAndSendEmail(
    now: Date,
    assignedCourses: UserAssignedCourse[],
    sentUsers: string[],
  ) {
    if (!assignedCourses[0].user.email) return;

    const courses = assignedCourses.map((uac) => uac.course);
    let nearestToEndSubscription: Subscription | undefined;
    let dueDate: Date | undefined | null;

    if (assignedCourses[0].user.subscriptions?.length > 0) {
      nearestToEndSubscription = assignedCourses[0].user.subscriptions
        .filter((sub) => sub.endDate > now)
        .reduce((prev, cur) => {
          if (!cur.autoRenew && cur.endDate < prev.endDate) return cur;
          return prev;
        }, assignedCourses[0].user.subscriptions[0]);

      dueDate = nearestToEndSubscription.endDate;
    } else {
      dueDate = assignedCourses.find((c) => c.dueDateTime)?.dueDateTime;
    }

    super.enqueueEmail({
      language: assignedCourses[0].user.emailNotificationLanguage,
      key: EmailNotificationSubCategoryKey.REMINDER_COMPLETE_ASSIGNED_COURSE,
      to: assignedCourses[0].user.email,
      replacements: {
        [NotificationVariableDict.FULL_NAME.alias]:
          assignedCourses[0].user.fullName,
        [NotificationVariableDict.COURSE_LIST.alias]: generateHtmlList(
          'ol',
          courses.map((c) =>
            getStringFromLanguage(
              c.title,
              assignedCourses[0].user.emailNotificationLanguage,
            ),
          ),
        ),
        [NotificationVariableDict.MEMBERSHIP_EXPIRY_DATE.alias]: dueDate
          ? formatWithTimezone(dueDate, DEFAULT_TIMEZONE, 'd MMM yyyy HH:mm')
          : '',
        [NotificationVariableDict.DASHBOARD_COURSES_LINK
          .alias]: `${this.configService.get('WEB_URL')}/dashboard/courses`,
      },
    });

    sentUsers.push(assignedCourses[0].userId);
  }
}
