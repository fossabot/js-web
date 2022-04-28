import { useEffect } from 'react';
import cx from 'classnames';
import Head from 'next/head';
import Layout from '../layouts/main.layout';
import { ITokenProps } from '../models/auth';
import useTranslation from '../i18n/useTranslation';
import MainNavBar from '../ui-kit/headers/MainNavbar';
import PaginationIndicator from '../shared/PaginationIndicator';
import useNotification from './useNotification';
import { NotificationList } from './NotificationList';
import Picture from '../ui-kit/Picture';
import { useRouter } from 'next/router';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useResponsive } from '../hooks/useResponsive';

interface IEventCalendarPageProps {
  token: ITokenProps;
}

export const NotificationPage = ({ token }: IEventCalendarPageProps) => {
  const { t } = useTranslation();
  const {
    fetchNotifications,
    userNotifications,
    pagination,
    markAllRead,
    markRead,
    fetchNotificationsOnScroll,
  } = useNotification();
  const router = useRouter();

  const { lg, md } = useResponsive();

  const loadOnScroll = async () => {
    if (lg == false && md == false) {
      //only load for small screens
      const nextPage: number = Number(pagination.page) + 1;
      await fetchNotificationsOnScroll(nextPage, pagination.perPage);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [router.query]);

  return (
    <>
      <Head>
        <title>
          {t('headerText')} | {t('notification.pageTitle')}
        </title>
      </Head>
      <Layout
        noMobilePadding
        header={
          <>
            <MainNavBar token={token} />
          </>
        }
      >
        <div className="relative w-full bg-white p-5 md:p-2 lg:mx-auto lg:w-181 lg:px-6 lg:pt-0">
          <div className="static lg:sticky lg:top-40">
            <div className="py-3 text-caption font-regular">
              <div className="flex justify-between">
                <div>
                  <div className="mb-1 text-lg font-bold text-black">
                    {t('notification.allNotifications')}
                  </div>
                </div>
                <div>
                  {userNotifications.length > 0 && (
                    <div
                      className="mb-1 block cursor-pointer text-base font-semibold text-maroon-400"
                      onClick={markAllRead}
                    >
                      {t('notification.markAllRead')}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {userNotifications.length > 0 && (
              <div className="block rounded-lg border border-solid p-4 md:hidden">
                <InfiniteScroll
                  dataLength={userNotifications.length}
                  next={loadOnScroll}
                  hasMore={
                    pagination
                      ? userNotifications.length !== pagination.total
                      : false
                  }
                  loader={null}
                >
                  <NotificationList
                    userNotifications={userNotifications}
                    markRead={markRead}
                  />
                </InfiniteScroll>
              </div>
            )}
            {userNotifications.length > 0 && (
              <div className="hidden rounded-lg border border-solid p-4 md:block">
                <NotificationList
                  userNotifications={userNotifications}
                  markRead={markRead}
                />
              </div>
            )}
            {userNotifications.length === 0 && (
              <div
                className={cx(
                  'mb-2 block rounded-lg border-none p-4 px-4 py-5 text-center md:border md:border-solid',
                )}
              >
                <div className="flex justify-center">
                  <Picture
                    className="h-30 w-30 md:h-28 md:w-28"
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
                <p className="text-subheading font-bold text-black lg:text-heading">
                  {t('notification.noNewNotification')}
                </p>
                <p className="mt-2 text-gray-500">
                  {t('notification.notificationAppear')}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="relative hidden w-full bg-white md:block lg:mx-auto lg:w-181 lg:px-6 lg:pt-0">
          {pagination !== undefined &&
            userNotifications !== undefined &&
            userNotifications.length > 0 && (
              <PaginationIndicator
                totalPages={pagination.totalPages}
                defaultPerPage={pagination.perPage}
                resultLength={userNotifications.length}
                totalRecords={pagination.total}
              />
            )}
        </div>
      </Layout>
    </>
  );
};
