import Head from 'next/head';
import { AccessControl } from '../../app-state/accessControl';
import { BACKEND_ADMIN_CONTROL } from '../../constants/policies';
import useTranslation from '../../i18n/useTranslation';
import { AdminLayout } from '../../layouts/admin.layout';
import { CourseDiscoveryList } from './CourseDiscoveryList';

export const CourseDiscoveryListPage = () => {
  const { t } = useTranslation();

  return (
    <AccessControl
      policyNames={[
        BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
        BACKEND_ADMIN_CONTROL.ACCESS_COURSE_DISCOVERY_MANAGEMENT,
      ]}
    >
      <AdminLayout>
        <Head>
          <title>
            {t('headerText')} | {t('courseDiscoveryManagementPage.title')}
          </title>
        </Head>

        <CourseDiscoveryList />
      </AdminLayout>
    </AccessControl>
  );
};
