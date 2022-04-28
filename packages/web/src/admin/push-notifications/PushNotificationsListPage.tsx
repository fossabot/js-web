import { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import { useToasts } from 'react-toast-notifications';
import { AccessControl } from '../../app-state/accessControl';
import API_PATHS from '../../constants/apiPaths';
import { BACKEND_ADMIN_CONTROL } from '../../constants/policies';
import useList from '../../hooks/useList';
import { notificationHttp } from '../../http';
import useTranslation from '../../i18n/useTranslation';
import { AdminLayout } from '../../layouts/admin.layout';
import { ITokenProps } from '../../models/auth';
import { INotification } from '../../models/notification';
import PaginationIndicator from '../../shared/PaginationIndicator';
import { Warning } from '../../ui-kit/icons';
import Picture from '../../ui-kit/Picture';
import { toastMessage } from '../../ui-kit/ToastMessage';
import { captureError } from '../../utils/error-routing';
import { PushNotificationList } from './PushNotificationList';
import { PushNotificationPreviewModal } from './PushNotificationPreviewModal';

export const PushNotificationsListPage: NextPage<ITokenProps> = () => {
  const { t } = useTranslation();
  const { addToast } = useToasts();
  const [targetPushNotification, setTargetPushNotification] =
    useState<INotification | null>(null);

  const {
    data: pushNotifications,
    fetchData,
    totalPages,
    count,
  } = useList<INotification>((options) => {
    return notificationHttp.get(API_PATHS.PUSH_NOTIFICATIONS, {
      params: options,
    });
  });

  const handleActiveChange = async (id: string, isActive: boolean) => {
    try {
      await notificationHttp.patch(
        API_PATHS.UPDATE_PUSH_NOTIFICATION_STATUS.replace(':id', id),
        { isActive },
      );
    } catch (e) {
      console.error(e);
      captureError(e);
      addToast(
        toastMessage({
          icon: <Warning className="h-5 w-5" />,
          title: e?.response?.data?.message || 'Something went wrong',
        }),
        { appearance: 'error' },
      );
    } finally {
      fetchData();
    }
  };

  const handlePreview = async (notification: INotification) => {
    setTargetPushNotification(notification);
  };

  return (
    <AccessControl
      policyNames={[
        BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
        BACKEND_ADMIN_CONTROL.ACCESS_PUSH_NOTIFICATION_MANAGEMENT,
      ]}
    >
      <AdminLayout>
        <Head>
          <title>
            {t('headerText')} | {t('pushNotificationListPage.header')}
          </title>
        </Head>
        <div className="mt-1 flex w-full flex-row justify-between">
          <p className="text-subtitle font-semibold">
            {t('pushNotificationListPage.header')}
          </p>
        </div>
        {pushNotifications && pushNotifications.length > 0 ? (
          <>
            <PushNotificationList
              pushNotifications={pushNotifications}
              onStatusChange={handleActiveChange}
              onClickPreview={handlePreview}
            />
            <PaginationIndicator
              defaultPerPage={15}
              totalPages={totalPages}
              totalRecords={count}
              resultLength={pushNotifications.length}
              showPageSizeDropDown={false}
            />
          </>
        ) : (
          <>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform">
              <Picture
                className="w-72"
                sources={[
                  {
                    srcSet: '/assets/admin-notification-empty.webp',
                    type: 'image/webp',
                  },
                ]}
                fallbackImage={{
                  src: '/assets/admin-notification-empty.png',
                }}
              />
              <div className="mt-8 text-center font-semibold">
                {t('pushNotificationListPage.empty')}
              </div>
            </div>
          </>
        )}
        <PushNotificationPreviewModal
          data={targetPushNotification}
          onClose={() => {
            setTargetPushNotification(null);
          }}
        />
      </AdminLayout>
    </AccessControl>
  );
};
