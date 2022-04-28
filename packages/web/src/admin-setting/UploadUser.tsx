import Head from 'next/head';
import { useRouter } from 'next/router';
import WEB_PATHS from '../constants/webPaths';
import AdminSettingApi from '../http/admin.setting.api';
import UploadApi from '../http/upload.api';
import useTranslation from '../i18n/useTranslation';
import { AdminLayout } from '../layouts/admin.layout';
import BulkUploadUsers from '../upload/BulkUploadUsers';

export default function UploadUser() {
  const api = {
    admin: AdminSettingApi,
    upload: UploadApi,
  };
  const router = useRouter();
  const { t } = useTranslation();

  const uploadFile = async (file: File, option: string) => {
    const key = await api.upload.uploadUserFileToS3(file);
    const success = await api.admin.uploadUserList(file.name, key, option);
    if (success) {
      router.push(WEB_PATHS.ADMIN_USER_UPLOAD_HISTORY);
    }
  };

  return (
    <AdminLayout>
      <Head>
        <title>{t('headerText')} | Upload User</title>
      </Head>
      <BulkUploadUsers uploadFile={uploadFile} />
    </AdminLayout>
  );
}
