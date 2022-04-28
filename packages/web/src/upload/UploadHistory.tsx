import { useState, useEffect } from 'react';
import Link from 'next/link';
import WEB_PATHS from '../constants/webPaths';
import { format } from 'date-fns';
import { TableColumn, TableHead } from '../ui-kit/Table';

export default function UploadHistory({ getUploadHistory, getDownloadUrl }) {
  const [uploadList, setUploadList] = useState([]);
  const [page] = useState(1);
  const perPage = 10;
  const headers = ['File', 'Status', 'Upload Date'];

  useEffect(() => {
    (async function fetchData() {
      try {
        const response = await getUploadHistory(page, perPage);
        setUploadList(response);
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  const downloadFile = async (key: string) => {
    const url = getDownloadUrl(key);
    window.open(url);
  };

  const renderTable = () => {
    if (uploadList.length <= 0) return;

    return (
      <div className="my-5">
        <table className="w-full border-collapse border text-left">
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
          return <TableHead key={header}>{header}</TableHead>;
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
        <tr key={'user-' + i} className="hover:bg-gray-100">
          <TableColumn>
            <a
              className="text-blue-200 underline visited:text-blue-400 hover:text-blue-300"
              onClick={() => {
                downloadFile(data.s3key);
              }}
            >
              {data.file}
            </a>
          </TableColumn>
          <TableColumn>{renderStatus(data.status)}</TableColumn>
          <TableColumn>
            {format(new Date(data.createdAt), 'dd MMMM yyyy H:mm')}
          </TableColumn>
        </tr>
      );
    });
  };

  return (
    <div className="rounded bg-white p-5">
      <div className="mb-5 flex content-between items-center">
        <div className="flex-1">
          <h1 className="text-lg font-bold">Upload History</h1>
        </div>
        <Link href={WEB_PATHS.ADMIN_USER_UPLOAD}>
          <button className="rounded bg-green-300 py-2 px-4 text-white hover:bg-green-200">
            Upload (.csv, .xls, .xlsx)
          </button>
        </Link>
      </div>
      <hr className="mb-5" />
      {renderTable()}
    </div>
  );
}
