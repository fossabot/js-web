import Head from 'next/head';
import Link from 'next/link';
import { AccessControl } from '../../app-state/accessControl';
import { BACKEND_ADMIN_CONTROL } from '../../constants/policies';
import WEB_PATHS from '../../constants/webPaths';
import useTranslation from '../../i18n/useTranslation';
import { AdminLayout } from '../../layouts/admin.layout';
import { ChevronLeft } from '../../ui-kit/icons';
import SessionForm from './SessionForm';
import { useSessionForm } from './useSessionForm';

export const SessionCreatePage = () => {
  const { t } = useTranslation();
  const formProps = useSessionForm();

  return (
    <AccessControl
      policyNames={[
        BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
        BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT,
      ]}
    >
      <AdminLayout>
        <Head>
          <title>{t('headerText')} | Create session</title>
        </Head>
        <header>
          <div>
            <Link href={WEB_PATHS.SESSION_MANAGEMENT}>
              <a className="flex items-center text-caption font-semibold text-gray-650">
                <ChevronLeft className="mr-2 h-4 w-4" />
                <span>{t('back')}</span>
              </a>
            </Link>
          </div>
          <div className="mx-auto my-8 flex w-100 flex-col justify-center">
            <div className="mb-6">
              <h5 className="border-b border-gray-200 pb-4 text-subtitle font-bold">
                Add Session
              </h5>
            </div>
            <SessionForm {...formProps} />
          </div>
        </header>
      </AdminLayout>
    </AccessControl>
  );
};
