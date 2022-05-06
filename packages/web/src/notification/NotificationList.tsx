import cx from 'classnames';
import { useRouter } from 'next/router';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';
import { LanguageCode } from '../models/language';
import { IUserNotification } from '../models/notification';
import { NotificationItem } from './NotificationItem';

interface NotificationListProps {
  userNotifications: Array<IUserNotification>;
  markRead: (number) => void;
  capHeight?: boolean;
}

export const NotificationList = ({
  userNotifications,
  markRead,
  capHeight = false,
}: NotificationListProps) => {
  const { locale } = useRouter();

  return (
    <>
      {userNotifications.length > 0 && (
        <PerfectScrollbar
          className={cx('overflow-y-auto overscroll-contain', {
            'max-h-1/2vh': capHeight,
          })}
        >
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
        </PerfectScrollbar>
      )}
    </>
  );
};
