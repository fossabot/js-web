import { Repository, LessThanOrEqual, MoreThan } from 'typeorm';
import { differenceInDays, addDays } from 'date-fns';

import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { Subscription } from '@seaccentral/core/dist/payment/Subscription.entity';
import { EmailNotification } from '@seaccentral/core/dist/notification/EmailNotification.entity';
import { EmailNotificationSubCategoryKey } from '@seaccentral/core/dist/notification/enum/EmailNotificationSubCategory.enum';
import { NotificationVariableDict } from '@seaccentral/core/dist/notification/NotificationVariableDict';
import { formatWithTimezone } from '@seaccentral/core/dist/utils/date';
import {
  BANGKOK_TIMEZONE,
  DEFAULT_TIMEZONE,
} from '@seaccentral/core/dist/utils/constants';
import { NotificationProducer } from '@seaccentral/core/dist/queue/notification.producer';

import { BaseReminder } from './baseReminder';

@Injectable()
export class SubscriptionExpirationReminder extends BaseReminder {
  constructor(
    @InjectRepository(EmailNotification)
    emailNotificationRepository: Repository<EmailNotification>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    private readonly configService: ConfigService,
    notificationProducer: NotificationProducer,
  ) {
    super(emailNotificationRepository, notificationProducer);
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM, {
    timeZone: BANGKOK_TIMEZONE,
  })
  async execute() {
    const emailNotif = await super.getEmailNotification(
      EmailNotificationSubCategoryKey.MEMBERSHIP_EXPIRY_REMINDER,
    );

    if (!emailNotif) return;

    const now = new Date();
    const reminderDays = super.getReminderDays(
      now,
      emailNotif.triggerType.triggerSeconds,
    );

    const nextFarthestDays = addDays(now, reminderDays[0]);
    const endingSubscription = await this.subscriptionRepository.find({
      where: {
        autoRenew: false,
        endDate: LessThanOrEqual(nextFarthestDays) && MoreThan(now),
      },
      relations: ['user'],
    });

    const emailUsers = endingSubscription.filter((s) => {
      const diff = differenceInDays(s.endDate, now);
      return reminderDays.includes(diff);
    });

    if (emailUsers.length > 0) {
      emailUsers.forEach(async (emailUser) => {
        if (!emailUser.user.email) return;

        const myPackageLink = `${this.configService.get(
          'WEB_URL',
        )}/account/my-packages`;

        super.enqueueEmail({
          key: EmailNotificationSubCategoryKey.MEMBERSHIP_EXPIRY_REMINDER,
          replacements: {
            [NotificationVariableDict.FULL_NAME.alias]: emailUser.user.fullName,
            [NotificationVariableDict.PACKAGE_PAGE_LINK.alias]: myPackageLink,
            [NotificationVariableDict.MEMBERSHIP_EXPIRY_DATE.alias]:
              formatWithTimezone(
                emailUser.endDate,
                DEFAULT_TIMEZONE,
                'd MMM yyyy HH:mm',
              ),
          },
          to: emailUser.user.email,
          language: emailUser.user.emailNotificationLanguage,
        });
      });
    }
  }
}
