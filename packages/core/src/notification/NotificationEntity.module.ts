import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailFormat } from './EmailFormat.entity';
import { EmailNotification } from './EmailNotification.entity';
import { PushNotificationCategory } from './PushNotificationCategory.entity';
import { EmailNotificationCategory } from './EmailNotificationCategory.entity';
import { PushNotification } from './PushNotification.entity';
import { SystemAnnouncement } from './SystemAnnouncement.entity';
import { PushNotificationSubCategory } from './PushNotificationSubCategory.entity';
import { EmailNotificationSubCategory } from './EmailNotificationSubCategory.entity';
import { EmailNotificationSenderDomain } from './EmailNotificationSenderDomain.entity';
import { NotificationTriggerType } from './NotificationTriggerType.entity';
import { UserNotification } from './UserNotification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EmailFormat,
      EmailNotification,
      EmailNotificationCategory,
      EmailNotificationSubCategory,
      EmailNotificationSenderDomain,
      NotificationTriggerType,
      PushNotificationCategory,
      PushNotificationSubCategory,
      PushNotification,
      SystemAnnouncement,
      UserNotification,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class NotificationEntityModule {}
