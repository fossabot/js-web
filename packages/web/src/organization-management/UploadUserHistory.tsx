import { format } from 'date-fns';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import WEB_PATHS from '../constants/webPaths';
import OrganizationApi from '../http/organization.api';
import UploadApi from '../http/upload.api';
import useTranslation from '../i18n/useTranslation';
import { AdminLayout } from '../layouts/admin.layout';

export default function UploadUserHistory() {
  const router = useRouter();
  const api = {
    organization: OrganizationApi,
    upload: UploadApi,
  };
  const { t } = useTranslation();
  const [uploadList, setUploadList] = useState([]);
  const [page] = useState(1);
  const perPage = 10;
  const headers = ['File', 'Status', 'Upload Date'];
  const { id } = router.query;

  useEffect(() => {
    (async function fetchData() {
      try {
        const response = await api.organization.getUploadUserHistory(
          id as string,
          page,
          perPage,
        );
        setUploadList(response);
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  const downloadFile = async (key: string) => {
    const url = api.upload.getDownloadUrl(key);
    window.open(url);
  };

  const renderTable = () => {
    if (uploadList.length <= 0) return;

    return (
      <div className="my-5">
        <table className="w-full border-separate border">
          <thead>{renderHeads()}</thead>
          <tbody>{renderRows()}</tbody>
        </table>
      </div>
    );
  };

  const renderHeads = () => {
    if (uploadList.length <= 0) return;

    return (
      <tr>
        {headers.map((header) => {
          return (
            <th className="border p-3" key={header}>
              {header}
            </th>
          );
        })}
      </tr>
    );
  };

  const renderRows = () => {
    if (uploadList.length <= 0) return;

    const renderStatus = (status: string) => {
      if (status === 'completed') {
        return (
          <span className="rounded bg-green-200 py-1 px-3">Completed</span>
        );
      } else if (status === 'failed') {
        return <span className="rounded bg-red-200 py-1 px-3">Failed</span>;
      } else {
        return <span className="rounded bg-yellow-200 py-1 px-3">Pending</span>;
      }
    };

    return uploadList.map((data, i) => {
      return (
        <tr key={'user-' + i}>
          <td className="border p-3">
            <a
              className="text-blue-200 underline visited:text-blue-400 hover:text-blue-300"
              onClick={() => {
                downloadFile(data.s3key);
              }}
            >
              {data.file}
            </a>
          </td>
          <td className="border p-3 text-center">
            {renderStatus(data.status)}
          </td>
          <td className="border p-3">
            {format(new Date(data.createdAt), 'dd MMMM yyyy H:mm')}
          </td>
        </tr>
      );
    });
  };

  return (
    <AdminLayout>
      <Head>
        <title>{t('headerText')} | Upload User History</title>
      </Head>
      <div className="rounded bg-white p-5">
        <div className="mb-5 flex content-between items-center">
          <div className="flex-1">
            <h1 className="text-lg font-bold">Upload History</h1>
          </div>
          <Link
            href={WEB_PATHS.ORGANIZATION_USER_UPLOAD.replace(
              ':id',
              id as string,
            )}
          >
            <a className="rounded bg-green-300 py-2 px-4 text-white hover:bg-green-200">
              Upload (.csv, .xls, .xlsx)
            </a>
          </Link>
        </div>
        <hr className="mb-5" />
        {renderTable()}
      </div>
    </AdminLayout>
  );
}
