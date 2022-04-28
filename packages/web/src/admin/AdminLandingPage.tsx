import { format } from 'date-fns';
import Head from 'next/head';
import { AccessControl } from '../app-state/accessControl';
import { useAuthInfo } from '../app-state/useAuthInfo';
import { BACKEND_ADMIN_CONTROL } from '../constants/policies';
import useTranslation from '../i18n/useTranslation';
import { AdminLayout } from '../layouts/admin.layout';

export const AdminLandingPage = () => {
  const { t } = useTranslation();
  const {
    context: {
      token: { user },
    },
  } = useAuthInfo();

  return (
    <AccessControl
      policyNames={[
        BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
        BACKEND_ADMIN_CONTROL.ACCESS_CATALOG_MENU_MANAGEMENT,
        BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT,
        BACKEND_ADMIN_CONTROL.ACCESS_CERTIFICATE_MANAGEMENT,
        BACKEND_ADMIN_CONTROL.ACCESS_GROUP_MANAGEMENT,
        BACKEND_ADMIN_CONTROL.ACCESS_USER_INVATATION_MANAGEMENT,
        BACKEND_ADMIN_CONTROL.ACCESS_LEARNING_TRACK_MANAGEMENT,
        BACKEND_ADMIN_CONTROL.ACCESS_LEARNING_WAY_MANAGEMENT,
        BACKEND_ADMIN_CONTROL.ACCESS_LINKED_PLANS,
        BACKEND_ADMIN_CONTROL.ACCESS_LOGIN_SETTINGS,
        BACKEND_ADMIN_CONTROL.ACCESS_MATERIAL_MANAGEMENT,
        BACKEND_ADMIN_CONTROL.ACCESS_ORGANIZATION_MANAGEMENT,
        BACKEND_ADMIN_CONTROL.ACCESS_PASSWORD_SETTINGS,
        BACKEND_ADMIN_CONTROL.ACCESS_PAYMENT_DASHBOARD,
        BACKEND_ADMIN_CONTROL.ACCESS_PLAN_MANAGEMENT,
        BACKEND_ADMIN_CONTROL.ACCESS_TAG_MANAGEMENT,
        BACKEND_ADMIN_CONTROL.ACCESS_TOPIC_MANAGEMENT,
        BACKEND_ADMIN_CONTROL.ACCESS_USER_MANAGEMENT,
        BACKEND_ADMIN_CONTROL.ACCESS_USER_UPLOAD,
        BACKEND_ADMIN_CONTROL.ACCESS_VIDEO_MANAGEMENT,
        BACKEND_ADMIN_CONTROL.ACCESS_ALL_CLASS_ATTENDANCE,
      ]}
    >
      <AdminLayout>
        <Head>
          <title>
            {t('headerText')} | {t('navbar.adminPanel')}
          </title>
        </Head>
        <section className="flex h-full flex-col">
          <div className="text-subheading font-bold text-gray-400">
            Welcome, {user.firstName}
          </div>
          <div className="text-subtitle font-semibold">
            {t('navbar.adminPanel')}
          </div>
          <div>{format(new Date(), 'EEEE d MMM yyyy').toUpperCase()}</div>
          <div className="my-8 h-px w-full bg-gray-200" />
          <div className="flex-1"></div>
          <div className="flex justify-end">
            <img src="/assets/admin.png" alt="" />
          </div>
        </section>
      </AdminLayout>
    </AccessControl>
  );
};
