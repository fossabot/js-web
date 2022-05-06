import Head from 'next/head';
import { useRouter } from 'next/router';
import { AccessControl } from '../../app-state/accessControl';
import { BACKEND_ADMIN_CONTROL } from '../../constants/policies';
import WEB_PATHS from '../../constants/webPaths';
import useTranslation from '../../i18n/useTranslation';
import { AdminLayout } from '../../layouts/admin.layout';
import { ChevronLeft } from '../../ui-kit/icons';
import { SystemAnnouncementForm } from './SystemAnnouncementForm';

export const SystemAnnouncementCreatePage = () => {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <AccessControl
      policyNames={[
        BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
        BACKEND_ADMIN_CONTROL.ACCESS_SYSTEM_ANNOUNCEMENT_MANAGEMENT,
      ]}
    >
      <AdminLayout>
        <Head>
          <title>
            {t('headerText')} | {t('systemAnnouncementCreatePage.header')}
          </title>
        </Head>
        <div className="mb-4">
          <a
            role="button"
            onClick={() => {
              router.push(WEB_PATHS.SYSTEM_ANNOUNCEMENT);
            }}
            className="flex items-center space-x-2 text-caption text-gray-650"
          >
            <ChevronLeft className="h-4" />
            <span>{t('back')}</span>
          </a>
        </div>
        <div className="mx-auto max-w-xl">
          <h1 className="text-subtitle font-semibold">
            {t('systemAnnouncementCreatePage.header')}
          </h1>
          <div className="mt-4 mb-8 h-px w-full bg-gray-200"></div>
          <SystemAnnouncementForm initialValues={null} />
        </div>
      </AdminLayout>
    </AccessControl>
  );
};
