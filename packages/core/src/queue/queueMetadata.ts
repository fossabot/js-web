import { PushNotificationSubCategoryKey } from '../notification/enum/PushNotificationSubCategory.enum';
import { Language } from '../language/Language.entity';
import { User } from '../user/User.entity';

interface IQueueMetadata {
  queueName: string;
  events: Record<string, string>;
}

interface INotificationMetadata extends IQueueMetadata {
  events: {
    sendEmail: string;
    notify: string;
  };
}

interface QueueMetadata {
  notification: INotificationMetadata;
}

export const QueueMetadata: QueueMetadata = {
  notification: {
    queueName: 'notification',
    events: {
      sendEmail: 'sendEmail',
      notify: 'notify',
    },
  },
};

export interface NotifyData {
  subCategoryKey: PushNotificationSubCategoryKey;
  userId: User['id'];
  variables: { [key: string]: Language | undefined | null | string | number };
}
