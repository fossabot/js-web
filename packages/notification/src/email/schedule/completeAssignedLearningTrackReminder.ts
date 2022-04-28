import { groupBy } from 'lodash';
import { Repository } from 'typeorm';
import { differenceInDays, addDays } from 'date-fns';

import { InjectRepository } from '@nestjs/typeorm';
import { EmailNotification } from '@seaccentral/core/dist/notification/EmailNotification.entity';
import { EmailNotificationSubCategoryKey } from '@seaccentral/core/dist/notification/enum/EmailNotificationSubCategory.enum';
import { UserAssignedLearningTrack } from '@seaccentral/core/dist/learning-track/UserAssignedLearningTrack.entity';
import {
  BANGKOK_TIMEZONE,
  DEFAULT_TIMEZONE,
} from '@seaccentral/core/dist/utils/constants';
import { UserEnrolledLearningTrackStatus } from '@seaccentral/core/dist/learning-track/UserEnrolledLearningTrackStatus.enum';
import { NotificationVariableDict } from '@seaccentral/core/dist/notification/NotificationVariableDict';
import { formatWithTimezone } from '@seaccentral/core/dist/utils/date';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { LearningTrack } from '@seaccentral/core/dist/learning-track/LearningTrack.entity';
import { Subscription } from '@seaccentral/core/dist/payment/Subscription.entity';
import { NotificationProducer } from '@seaccentral/core/dist/queue/notification.producer';
import { LanguageCode } from '@seaccentral/core/dist/language/Language.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { getStringFromLanguage } from '@seaccentral/core/dist/utils/language';

import { generateHtmlList } from '@seaccentral/core/dist/utils/email';
import { BaseReminder } from './baseReminder';

@Injectable()
export class CompleteAssignedLearningTrackReminder extends BaseReminder {
  constructor(
    @InjectRepository(EmailNotification)
    emailNotificationRepository: Repository<EmailNotification>,
    @InjectRepository(UserAssignedLearningTrack)
    private readonly userAssignedLTRepository: Repository<UserAssignedLearningTrack>,
    private readonly configService: ConfigService,
    notificationProducer: NotificationProducer,
  ) {
    super(emailNotificationRepository, notificationProducer);
  }

  @Cron(CronExpression.EVERY_DAY_AT_4AM, {
    timeZone: BANGKOK_TIMEZONE,
  })
  async execute(): Promise<void> {
    const emailNotif = await super.getEmailNotification(
      EmailNotificationSubCategoryKey.REMINDER_COMPLETE_ASSIGNED_LEARNING_TRACK,
    );

    if (!emailNotif) return;

    const now = new Date();
    const reminderDays = super.getReminderDays(
      now,
      emailNotif.triggerType.triggerSeconds,
    );

    const nextFarthestDays = addDays(now, reminderDays[0]);

    // Get user-assigned-LT where due date is less than or equal nextFarthestDays (expectedly 30 days)
    const ualt = await this.userAssignedLTRepository
      .createQueryBuilder('ualt')
      .leftJoinAndSelect('ualt.user', 'user')
      .leftJoinAndSelect('user.subscriptions', 'subscription')
      .leftJoinAndSelect('ualt.learningTrack', 'lt')
      .leftJoinAndSelect('lt.title', 'ltTitle')
      .leftJoinAndSelect('lt.userEnrolledLearningTrack', 'uelt')
      .where('uelt.status != :progressStatus')
      .andWhere('ualt.dueDateTime IS NOT NULL')
      .andWhere('ualt.dueDateTime > :now')
      .andWhere('ualt.dueDateTime <= :nextFarthestDays')
      .setParameters({
        now,
        nextFarthestDays,
        progressStatus: UserEnrolledLearningTrackStatus.COMPLETED,
      })
      .getMany();
    if (!ualt || ualt.length < 1) return;

    // Filter users by checking if their subscription remaining days equal configured number of days.
    const emailUsers = ualt.filter((s) => {
      const diff = differenceInDays(s.dueDateTime!, now);
      return reminderDays.includes(diff);
    });

    const sentUserId: string[] = [];
    emailUsers.forEach((emailUser) => {
      if (!emailUser.user.email || sentUserId.includes(emailUser.userId))
        return;

      const allLT = emailUsers
        .filter((u) => u.userId === emailUser.userId)
        .map((userAssignedLT) => userAssignedLT.learningTrack);

      const dueDate = this.getDueDate(
        now,
        emailUser.user.subscriptions,
        emailUsers,
      );

      this.sendEmail({
        allLT,
        fullName: emailUser.user.fullName,
        email: emailUser.user.email,
        language: emailUser.user.emailNotificationLanguage,
        dueDate,
      });

      sentUserId.push(emailUser.userId);
    });

    const users = await this.getNearlyExpiredSubscription(now, reminderDays);
    if (Object.keys(users).length < 1) return;

    Object.keys(users).forEach((userId) => {
      if (sentUserId.includes(userId)) return;

      const userAssignedLT = users[userId];
      const dueDate = this.getDueDate(
        now,
        users[userId][0].user.subscriptions,
        userAssignedLT,
      );

      this.sendEmail({
        allLT: userAssignedLT.map((x) => x.learningTrack),
        fullName: userAssignedLT[0].user.fullName,
        email: userAssignedLT[0].user.email || '',
        language: userAssignedLT[0].user.emailNotificationLanguage,
        dueDate,
      });

      sentUserId.push(userId);
    });
  }

  private getDueDate(
    now: Date,
    subscriptions: Subscription[],
    userAssignedLTs: UserAssignedLearningTrack[],
  ): Date | null {
    if (subscriptions.length > 0) {
      const nearestToEndSubscription = subscriptions
        .filter((sub) => sub.endDate > now)
        .reduce((prev, cur) => {
          if (!cur.autoRenew && cur.endDate < prev.endDate) return cur;
          return prev;
        }, subscriptions[0]);

      return nearestToEndSubscription.endDate;
    }

    const ualt = userAssignedLTs.find((x) => !!x.dueDateTime);

    return ualt?.dueDateTime ? ualt.dueDateTime : null;
  }

  private async getNearlyExpiredSubscription(
    now: Date,
    reminderDays: number[],
  ): Promise<Record<string, UserAssignedLearningTrack[]>> {
    const nextFarthestDays = addDays(now, reminderDays[0]);

    const ualt = await this.userAssignedLTRepository
      .createQueryBuilder('ualt')
      .leftJoinAndSelect('ualt.learningTrack', 'lt')
      .leftJoinAndSelect('lt.title', 'title')
      .leftJoinAndSelect('ualt.user', 'user')
      .innerJoinAndSelect('user.subscriptions', 'subscription')
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

    const filtered = ualt.reduce((prev, curr) => {
      const expiringSub = curr.user.subscriptions.some((s) => {
        const diff = differenceInDays(s.endDate, now);
        return reminderDays.includes(diff);
      });

      if (expiringSub) prev.push(curr);

      return prev;
    }, [] as UserAssignedLearningTrack[]);

    const result = groupBy(filtered, (s) => s.userId);

    return result;
  }

  private async sendEmail(data: {
    fullName: string;
    allLT: LearningTrack[];
    email: string;
    language: LanguageCode;
    dueDate: Date | null;
  }) {
    const ltDashboardLink = `${this.configService.get(
      'WEB_URL',
    )}/dashboard/learning-tracks`;
    const { fullName, allLT, email, language, dueDate } = data;

    await super.enqueueEmail({
      language,
      key: EmailNotificationSubCategoryKey.REMINDER_COMPLETE_ASSIGNED_LEARNING_TRACK,
      replacements: {
        [NotificationVariableDict.FULL_NAME.alias]: fullName,
        [NotificationVariableDict.MEMBERSHIP_EXPIRY_DATE.alias]: dueDate
          ? formatWithTimezone(dueDate, DEFAULT_TIMEZONE, 'd MMM yyyy HH:mm')
          : '',
        [NotificationVariableDict.LEARNING_TRACK_LIST.alias]: generateHtmlList(
          'ol',
          allLT.map((lt) => getStringFromLanguage(lt.title, language)),
        ),
        [NotificationVariableDict.DASHBOARD_LEARNING_TRACKS_LINK.alias]:
          ltDashboardLink,
      },
      to: email,
    });
  }
}
