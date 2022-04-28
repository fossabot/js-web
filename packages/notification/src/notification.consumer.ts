import { Process, Processor } from '@nestjs/bull';
import { SendEmailQuery } from '@seaccentral/core/dist/notification/dto/SendEmailQuery';
import {
  NotifyData,
  QueueMetadata,
} from '@seaccentral/core/dist/queue/queueMetadata';
import { Job } from 'bull';
import { EmailService } from './email/email.service';
import { NotifyService } from './push/notify.service';
import { PushService } from './push/push.service';

/**
 * Consumer of notification event
 */
@Processor(QueueMetadata.notification.queueName)
export class NotificationConsumer {
  constructor(
    private readonly emailService: EmailService,
    private readonly pushService: PushService,
    private readonly notifyService: NotifyService,
  ) {}

  @Process(QueueMetadata.notification.events.sendEmail)
  handleSendEmail(job: Job<SendEmailQuery>) {
    this.emailService.sendEmail(job.data);
  }

  @Process(QueueMetadata.notification.events.notify)
  async notify(job: Job<NotifyData>) {
    const { subCategoryKey, userId, variables } = job.data;

    const notification = await this.notifyService.getPushNotificationByKey(
      subCategoryKey,
    );

    if (!notification) return;

    await Promise.all([
      this.notifyService.createNotification(notification, userId, variables),
      // TODO: We can make the client subscribe to group and org channel as well
      // in order to notify in bulk
      this.pushService.publish({}, userId),
    ]);
  }
}
