import { addSeconds, intervalToDuration } from 'date-fns';
import { Repository } from 'typeorm';

import { EmailNotification } from '@seaccentral/core/dist/notification/EmailNotification.entity';
import { EmailNotificationSubCategoryKey } from '@seaccentral/core/dist/notification/enum/EmailNotificationSubCategory.enum';
import { NotificationProducer } from '@seaccentral/core/dist/queue/notification.producer';
import { SendEmailQuery } from '@seaccentral/core/dist/notification/dto/SendEmailQuery';

export abstract class BaseReminder {
  abstract execute(): Promise<void>;

  constructor(
    private readonly emailNotificationRepository: Repository<EmailNotification>,
    private readonly notificationProducer: NotificationProducer,
  ) {}

  protected async getEmailNotification(
    key: EmailNotificationSubCategoryKey,
  ): Promise<EmailNotification | undefined> {
    const emailNotif = await this.emailNotificationRepository.findOne({
      where: {
        category: {
          key,
        },
        isActive: true,
      },
      relations: ['triggerType', 'category'],
    });

    return emailNotif;
  }

  protected getReminderDays(now: Date, triggerSeconds: number[]): number[] {
    return triggerSeconds
      .map((seconds) => {
        const { days, months } = intervalToDuration({
          start: now,
          end: addSeconds(now, seconds),
        });

        return Number((days ?? 0) + (months ?? 0) * 30);
      })
      .sort((a, b) => b - a);
  }

  /**
   * Enqueue email sending since we have limited capacity to send email at a time.
   * So using queue will allow us to retry in case of failure.
   * @param email
   */
  protected enqueueEmail(email: SendEmailQuery) {
    this.notificationProducer.sendEmail(email);
  }
}
