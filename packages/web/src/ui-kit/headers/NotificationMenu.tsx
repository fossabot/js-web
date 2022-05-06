import cx from 'classnames';
import Link from 'next/link';
import { useContext, useEffect } from 'react';
import { NotificationContext } from '../../app-state/notificationContext';
import WEB_PATHS from '../../constants/webPaths';
import useTranslation from '../../i18n/useTranslation';
import { NotificationList } from '../../notification/NotificationList';
import useNotification from '../../notification/useNotification';
import { ArrowRight } from '../../ui-kit/icons';
import Picture from '../../ui-kit/Picture';
import { IHeaderProps } from './MainNavbar';
import { NotificationBubble } from './NotificationBubble';

interface IUserMenuProps {
  showNotificationMenu: boolean;
  handleClickNotificationBubble: () => void;
  theme?: IHeaderProps['theme'];
  isOnTop?: boolean;
}

export const NotificationMenu = ({
  showNotificationMenu,
  handleClickNotificationBubble,
  theme = 'default',
  isOnTop = false,
}: IUserMenuProps) => {
  const { t } = useTranslation();
  const { userNotifications, fetchNotifications, markAllRead, markRead } =
    useNotification({ page: 1, perPage: 5 });

  const { notificationCount: count } = useContext(NotificationContext);

  useEffect(() => {
    fetchNotifications(); //fetch notifications when count is changed, count is changed when push notification is received
  }, [count]);

  return (
    <>
      <NotificationBubble />
      <div
        className={cx(
          'mt-1 w-400px rounded-lg bg-white lg:absolute lg:top-full lg:right-8 lg:shadow-lg',
          !showNotificationMenu && 'lg:hidden',
        )}
      >
        <div className="px-4 py-3 text-caption font-regular">
          <div className="flex justify-between">
            <div>
              <div className="text-lg font-bold text-black">
                <span>{t('notification.notifications')}</span>
              </div>
            </div>
            {userNotifications.length > 0 && (
              <div
                className="mb-1 block cursor-pointer text-base font-semibold text-maroon-400"
                onClick={markAllRead}
              >
                {t('notification.markAllRead')}
              </div>
            )}
          </div>
          <div className="mt-2 border-b border-gray-200" />
        </div>
        <NotificationList
          userNotifications={userNotifications}
          markRead={markRead}
          capHeight
        />
        {userNotifications.length > 0 && (
          <div className="px-4 py-3 text-caption font-regular">
            <div className="border-b border-gray-200" />
            <div>
              <div className="mb-1 mt-3 flex items-center justify-center text-center font-semibold text-maroon-400">
                <Link href={WEB_PATHS.NOTIFICATION}>
                  {t('notification.seeAll')}
                </Link>
                <div className="ml-1">
                  <ArrowRight width={20} />
                </div>
              </div>
            </div>
          </div>
        )}
        {userNotifications.length === 0 && (
          <div className="mb-2 px-4 py-5 text-center">
            <div className="flex justify-center">
              <Picture
                className="h-28 w-28"
                sources={[
                  {
                    srcSet: `/assets/no-notification.webp`,
                    type: 'image/webp',
                  },
                ]}
                fallbackImage={{
                  src: `/assets/no-notification.png`,
                }}
              />
            </div>
            <p className="mt-2 text-subheading font-bold text-black lg:text-heading">
              {t('notification.noNewNotification')}
            </p>
            <p className="mt-2 text-gray-500">
              {t('notification.notificationAppear')}
            </p>
          </div>
        )}
      </div>
    </>
  );
};
