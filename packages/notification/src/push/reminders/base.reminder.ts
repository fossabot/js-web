import { PushNotificationSubCategoryKey } from '@seaccentral/core/dist/notification/enum/PushNotificationSubCategory.enum';
import { PushNotification } from '@seaccentral/core/dist/notification/PushNotification.entity';
// eslint-disable-next-line no-restricted-imports
import { addSeconds, endOfDay, isBefore, isSameDay } from 'date-fns';
import { Repository, SelectQueryBuilder } from 'typeorm';

export abstract class BaseNotificationReminder {
  constructor(
    private readonly pushNotificationRepository: Repository<PushNotification>,
  ) {}

  abstract execute(): Promise<void>;

  protected async getPushNotification(key: PushNotificationSubCategoryKey) {
    const notification = await this.pushNotificationRepository.findOne({
      join: {
        alias: 'notification',
        innerJoin: { subCategory: 'notification.category' },
      },
      where: (qb: SelectQueryBuilder<PushNotification>) => {
        qb.where('notification.isActive = :isActive')
          .andWhere('subCategory.key = :key')
          .setParameters({
            isActive: true,
            key,
          });
      },
    });

    return {
      notification,
      triggerSeconds: notification?.triggerType.triggerSeconds,
    };
  }

  generateNotificationsItems<T>(
    data: T[],
    triggerSeconds: number[],
    now: Date,
    criteria: (datum: T) => Date,
    callback: (datum: T) => void,
  ) {
    data.forEach((datum) => {
      triggerSeconds.forEach((seconds) => {
        if (this.isValidPushNotificationTime(now, criteria(datum), seconds))
          callback(datum);
      });
    });
  }

  protected isValidPushNotificationTime(
    now: Date,
    criteria: Date,
    triggerSecond: number,
  ) {
    const sendDate = addSeconds(criteria, triggerSecond);

    return isBefore(now, endOfDay(sendDate)) && isSameDay(now, sendDate);
  }
}
