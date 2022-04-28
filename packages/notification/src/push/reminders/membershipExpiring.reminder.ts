import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationProducer } from '@seaccentral/core/dist/queue/notification.producer';
import { PushNotificationSubCategoryKey } from '@seaccentral/core/dist/notification/enum/PushNotificationSubCategory.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { BANGKOK_TIMEZONE } from '@seaccentral/core/dist/utils/constants';
import { PushNotification } from '@seaccentral/core/dist/notification/PushNotification.entity';
import { NotificationVariableDict as NV } from '@seaccentral/core/dist/notification/NotificationVariableDict';
import { Subscription } from '@seaccentral/core/dist/payment/Subscription.entity';
import { BaseNotificationReminder } from './base.reminder';

@Injectable()
export class MembershipExpiringReminder extends BaseNotificationReminder {
  constructor(
    private readonly notificationProducer: NotificationProducer,
    @InjectRepository(Subscription)
    private readonly subscription: Repository<Subscription>,
    @InjectRepository(PushNotification)
    private readonly pushNotification: Repository<PushNotification>,
  ) {
    super(pushNotification);
  }

  @Cron(CronExpression.EVERY_DAY_AT_7AM, { timeZone: BANGKOK_TIMEZONE })
  async execute() {
    const { notification, triggerSeconds } = await super.getPushNotification(
      PushNotificationSubCategoryKey.MEMBERSHIP_EXPIRING_REMINDER,
    );

    if (!notification || !triggerSeconds) return;

    const now = new Date();

    const subscriptions = await this.subscription.find({
      where: {
        isActive: true,
        endDate: MoreThanOrEqual(now),
      },
      relations: ['subscriptionPlan'],
    });

    const notifications: { subscription: Subscription; userId: string }[] = [];

    super.generateNotificationsItems(
      subscriptions,
      triggerSeconds,
      now,
      (subscription) => subscription.endDate,
      (subscription) =>
        notifications.push({ subscription, userId: subscription.userId }),
    );

    await Promise.all(
      notifications.map((n) =>
        this.notificationProducer.notify(
          PushNotificationSubCategoryKey.MEMBERSHIP_EXPIRING_REMINDER,
          n.userId,
          {
            [NV.PACKAGE_NAME.alias]:
              n.subscription.subscriptionPlan.displayName ||
              n.subscription.subscriptionPlan.name,
          },
        ),
      ),
    );
  }
}
