import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { SendEmailQuery } from '../notification/dto/SendEmailQuery';

import { NotifyData, QueueMetadata } from './queueMetadata';

@Injectable()
export class NotificationProducer {
  constructor(
    @InjectQueue(QueueMetadata.notification.queueName) private q: Queue,
  ) {}

  sendEmail(email: SendEmailQuery) {
    // If using `withTransaction`, make sure to exclude this class so that
    // `this.q` will not become undefined

    if (this.q) {
      this.q.add(QueueMetadata.notification.events.sendEmail, email, {
        // Retry until success as fixed interval.
        backoff: {
          type: 'fixed',
          delay: 5000,
        },
        attempts: Number.MAX_SAFE_INTEGER,
      });
    } else {
      throw new Error(
        'If using `withTransaction`, make sure to exclude `NotificationProducer`',
      );
    }
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
