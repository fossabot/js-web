import Head from 'next/head';
import { useRouter } from 'next/router';
import WEB_PATHS from '../constants/webPaths';
import OrganizationApi from '../http/organization.api';
import UploadApi from '../http/upload.api';
import useTranslation from '../i18n/useTranslation';
import { AdminLayout } from '../layouts/admin.layout';
import BulkUploadUsers from '../upload/BulkUploadUsers';

export default function UploadOrganizationUser() {
  const api = {
    organization: OrganizationApi,
    upload: UploadApi,
  };
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = router.query;

  const uploadFile = async (file: File, option: string) => {
    const key = await api.upload.uploadUserFileToS3(file);
    const success = await api.organization.uploadUserList(
      id as string,
      file.name,
      key,
      option,
    );
    if (success) {
      router.push(
        WEB_PATHS.ORGANIZATION_USER_UPLOAD_HISTORY.replace(':id', id as string),
      );
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
