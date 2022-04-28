import { NextPage } from 'next';
import Head from 'next/head';
import { AccessControl } from '../../app-state/accessControl';
import { BACKEND_ADMIN_CONTROL } from '../../constants/policies';
import useTranslation from '../../i18n/useTranslation';
import { AdminLayout } from '../../layouts/admin.layout';
import { ITokenProps } from '../../models/auth';
import Button from '../../ui-kit/Button';
import { useEmailNotificationListPage } from './useEmailNotificationListPage';
import { EmailNotificationList } from './EmailNotificationList';
import PaginationIndicator from '../../shared/PaginationIndicator';
import Link from 'next/link';
import WEB_PATHS from '../../constants/webPaths';
import { useEffect } from 'react';
import { EMAIL_NOTIFICATION_PREVIEW } from '../../constants/localstorage';

const ITEMS_PER_PAGE = 10;

export const EmailNotificationListPage: NextPage<ITokenProps> = () => {
  const { t } = useTranslation();
  const { emailNotifications, handleActiveChange } =
    useEmailNotificationListPage();

  useEffect(() => {
    return () => {
      window.localStorage.removeItem(EMAIL_NOTIFICATION_PREVIEW);
    };
  }, []);

  return (
    <AccessControl
      policyNames={[
        BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
        BACKEND_ADMIN_CONTROL.ACCESS_EMAIL_NOTIFICATIONS,
      ]}
    >
      <AdminLayout>
        <Head>
          <title>
            {t('headerText')} | {t('emailNotificationListPage.headerTitle')}
          </title>
        </Head>
        <header className="mt-2 flex items-center space-x-4">
          <div className="flex-1 text-subtitle font-semibold">
            {t('emailNotificationListPage.emailNotification')}
          </div>
          <Link href={WEB_PATHS.EMAIL_FORMAT}>
            <a>
              <Button
                variant="secondary"
                avoidFullWidth
                className="h-11 space-x-2 py-2 px-5 font-semibold"
              >
                Email Format
              </Button>
            </a>
          </Link>
          <Link href={WEB_PATHS.EMAIL_LOGS}>
            <a>
              <Button
                variant="secondary"
                avoidFullWidth
                className="h-11 space-x-2 py-2 px-5 font-semibold"
              >
                Email Log
              </Button>
            </a>
          </Link>
        </header>
        <div className="mt-6" />
        {emailNotifications.data.length > 0 ? (
          <>
            <EmailNotificationList
              emailNotifications={emailNotifications.data}
              onStatusChange={handleActiveChange}
            />
            <PaginationIndicator
              defaultPerPage={ITEMS_PER_PAGE}
              totalPages={emailNotifications.totalPages}
              totalRecords={emailNotifications.count}
              resultLength={emailNotifications.data.length}
              showPageSizeDropDown={true}
            />
          </>
        ) : (
          <>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform">
              <img src="/assets/empty-letter.png" className="mx-auto w-40" />
              <div className="mt-8 text-center font-semibold">
                {t('emailNotificationListPage.noEmailNotification')}
              </div>
            </div>
          </>
        )}
      </AdminLayout>
    </AccessControl>
  );
};
