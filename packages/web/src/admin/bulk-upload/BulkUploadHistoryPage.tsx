import axios from 'axios';
import fileDownload from 'js-file-download';
import Head from 'next/head';
import { AccessControl } from '../../app-state/accessControl';
import { BACKEND_ADMIN_CONTROL, PolicyEnum } from '../../constants/policies';
import useList, { FetchOptions } from '../../hooks/useList';
import { centralHttp } from '../../http';
import useTranslation from '../../i18n/useTranslation';
import { AdminLayout } from '../../layouts/admin.layout';
import Button from '../../ui-kit/Button';
import BulkUploadHistoryList, {
  IBulkUploadItem,
} from './BulkUploadHistoryList';

export interface IBulkUploadHistoryPageProps {
  pageTitle: string;
  historyApiPath: string;
  downloadApiPath: string;
  policyNames: PolicyEnum[];
  uploadPagePath: string;
}

export const BulkUploadHistoryPage = ({
  pageTitle,
  historyApiPath,
  downloadApiPath,
  policyNames,
  uploadPagePath,
}: IBulkUploadHistoryPageProps) => {
  const { t } = useTranslation();

  const { data, totalPages } = useList<IBulkUploadItem>((options) => {
    return getHistory(options);
  });

  const getHistory = (options: FetchOptions) => {
    return centralHttp.get(historyApiPath, {
      params: options,
    });
  };

  async function handleDownload(file: string, key: string) {
    const url = `${downloadApiPath}?key=${key}`;
    const { data } = await centralHttp.get(url);
    const res = await axios.get(data.data, { responseType: 'blob' });
    fileDownload(res.data, file);
  }

  return (
    <AccessControl
      policyNames={[BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL, ...policyNames]}
    >
      <AdminLayout>
        <Head>
          <title>
            {t('headerText')} | {pageTitle}
          </title>
        </Head>
        <div className="mx-6 text-right lg:mx-8">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex w-1/4">
              <h2 className="mb-2 py-2 text-left font-bold text-black">
                {pageTitle}
              </h2>
            </div>
            <div className="mb-4 flex w-3/4 flex-row items-center justify-end text-right">
              <div className="mx-1 w-1/3">
                <Button
                  size="medium"
                  type="submit"
                  variant="primary"
                  link={uploadPagePath}
                >
                  Upload (.xlsx)
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <BulkUploadHistoryList
              uploadedItems={data}
              totalPages={totalPages}
              onDownload={handleDownload}
            />
          </div>
        </div>
      </AdminLayout>
    </AccessControl>
  );
};
