import { useRouter } from 'next/router';
import { IUserNotification } from '../models/notification';
import { NotificationItem } from './NotificationItem';
import { LanguageCode } from '../models/language';

interface NotificationListProps {
  userNotifications: Array<IUserNotification>;
  markRead: (number) => void;
}

export const NotificationList = ({
  userNotifications,
  markRead,
}: NotificationListProps) => {
  const { locale } = useRouter();

  return (
    <>
      {userNotifications.length > 0 && (
        <div>
          {userNotifications.map((item) => (
            <NotificationItem
              key={item.id}
              categoryKey={item.notification.category.key}
              content={item.notification.content}
              createdAt={item.createdAt}
              id={item.id}
              isRead={item.isRead}
              onMarkRead={markRead}
              locale={locale as LanguageCode}
            />
          ))}
        </div>
      )}
    </>
  );
};
