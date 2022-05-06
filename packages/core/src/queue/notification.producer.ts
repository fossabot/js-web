import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { EmailNotificationSubCategoryKey } from '../notification/enum/EmailNotificationSubCategory.enum';
import { SendEmailQuery } from '../notification/dto/SendEmailQuery';
import { EmailNotificationFilterService } from './emailNotificationFilter.service';

import { NotifyData, QueueMetadata } from './queueMetadata';

const whitelist: EmailNotificationSubCategoryKey[] = [
  EmailNotificationSubCategoryKey.MEMBERSHIP_WELCOME,
  EmailNotificationSubCategoryKey.MEMBERSHIP_VERIFY_EMAIL,
  EmailNotificationSubCategoryKey.MEMBERSHIP_SET_PASSWORD,
  EmailNotificationSubCategoryKey.REMINDER_ACTIVATE_ACCOUNT,
];

@Injectable()
export class NotificationProducer {
  constructor(
    @InjectQueue(QueueMetadata.notification.queueName) private q: Queue,
    private readonly emailNotificationFilterService: EmailNotificationFilterService,
  ) {}

  async sendEmail(email: SendEmailQuery) {
    if (whitelist.includes(email.key)) {
      return this.enqueueEmail(email);
    }
    const activatedUsers =
      await this.emailNotificationFilterService.filterActivatedUser(email);
    if (activatedUsers.length <= 0) {
      return null;
    }
    return this.enqueueEmail({ ...email, to: activatedUsers });
  }

  private enqueueEmail(email: SendEmailQuery) {
    // If using `withTransaction`, make sure to exclude this class so that
    // `this.q` will not become undefined

    if (this.q) {
      return this.q.add(QueueMetadata.notification.events.sendEmail, email, {
        // Retry until success as fixed interval.
        backoff: {
          type: 'fixed',
          delay: 5000,
        },
        attempts: Number.MAX_SAFE_INTEGER,
      });
    }
    throw new Error(
      'If using `withTransaction`, make sure to exclude `NotificationProducer`',
    );
  }

  async notify(
    subCategoryKey: NotifyData['subCategoryKey'],
    userId: NotifyData['userId'],
    variables: NotifyData['variables'],
  ) {
    await this.q.add(QueueMetadata.notification.events.notify, {
      subCategoryKey,
      userId,
      variables,
    });
  }
}
