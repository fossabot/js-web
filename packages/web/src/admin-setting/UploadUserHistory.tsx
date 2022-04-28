import Head from 'next/head';
import { AccessControl } from '../app-state/accessControl';
import { BACKEND_ADMIN_CONTROL } from '../constants/policies';
import AdminSettingApi from '../http/admin.setting.api';
import UploadApi from '../http/upload.api';
import useTranslation from '../i18n/useTranslation';
import { AdminLayout } from '../layouts/admin.layout';
import UploadHistory from '../upload/UploadHistory';

export default function UploadUserHistory() {
  const api = {
    admin: AdminSettingApi,
    upload: UploadApi,
  };
  const { t } = useTranslation();

  return (
    <AccessControl
      policyNames={[
        BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
        BACKEND_ADMIN_CONTROL.ACCESS_USER_UPLOAD,
      ]}
    >
      <AdminLayout>
        <Head>
          <title>{t('headerText')} | Upload User History</title>
        </Head>
        <UploadHistory
          getUploadHistory={api.admin.getUploadUserHistory}
          getDownloadUrl={api.upload.getDownloadUrl}
        />
      </AdminLayout>
    </AccessControl>
  );
}
