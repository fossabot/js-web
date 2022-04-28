import { format } from 'date-fns';
import { FunctionComponent } from 'react';
import { User } from '../../models/user';
import ListSearch from '../../ui-kit/ListSearch';
import Pagination from '../../ui-kit/Pagination';
import { TableColumn, TableHead } from '../../ui-kit/Table';

export interface IBulkUploadItem {
  id: string;
  file: string;
  s3key: string;
  status: string;
  uploadedBy: User;
  createdAt: string;
}

interface IProps {
  uploadedItems: IBulkUploadItem[];
  totalPages?: number;
  onDownload: (file: string, key: string) => Promise<void>;
}

interface IBulkUploadItemProps {
  uploadedItem: IBulkUploadItem;
  onDownload: (file: string, key: string) => Promise<void>;
}

const renderStatus = (status: string) => {
  if (status === 'completed') {
    return <span className="rounded bg-green-200 py-1 px-3">Completed</span>;
  } else if (status === 'failed') {
    return <span className="rounded bg-red-200 py-1 px-3">Failed</span>;
  } else {
    return <span className="rounded bg-yellow-200 py-1 px-3">Pending</span>;
  }
};

const BulkUploadItem: FunctionComponent<IBulkUploadItemProps> = ({
  uploadedItem,
  onDownload,
}) => {
  return (
    <tr className="hover:bg-gray-100">
      <TableColumn>
        <a
          className="text-black underline visited:text-blue-400 hover:text-blue-300"
          onClick={() => {
            onDownload(uploadedItem.file, uploadedItem.s3key);
          }}
        >
          {uploadedItem.file}
        </a>
      </TableColumn>
      <TableColumn>{renderStatus(uploadedItem.status)}</TableColumn>
      <TableColumn>{uploadedItem.uploadedBy.email}</TableColumn>
      <TableColumn>
        {format(new Date(uploadedItem.createdAt), 'dd MMMM yyyy H:mm')}
      </TableColumn>
    </tr>
  );
};

const searchOptions = [{ label: 'File', value: 'file' }];
const sortOptions = [{ label: 'Created Date', value: 'createdAt' }];

const BulkUploadHistoryList: FunctionComponent<IProps> = (props) => {
  return (
    <>
      <ListSearch
        defaultSearchField="title"
        fieldOptions={searchOptions}
        sortOptions={sortOptions}
      />
      <div className="my-4 overflow-x-scroll rounded bg-white shadow-md">
        <table className="w-full table-auto border-collapse border text-left">
          <thead>
            <tr>
              <TableHead className="w-1/4">File</TableHead>
              <TableHead className="w-1/4">Status</TableHead>
              <TableHead className="w-1/4">Created By</TableHead>
              <TableHead className="w-1/4">Created At</TableHead>
            </tr>
          </thead>
          <tbody>
            {props.uploadedItems && props.uploadedItems.length > 0 ? (
              props.uploadedItems.map((uploadedItem) => (
                <BulkUploadItem
                  key={uploadedItem.id}
                  uploadedItem={uploadedItem}
                  onDownload={props.onDownload}
                />
              ))
            ) : (
              <tr className="text-center hover:bg-gray-100">
                <TableColumn colSpan={9}>No records found!</TableColumn>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {props.totalPages > 0 && <Pagination totalPages={props.totalPages} />}
    </>
  );
};

export default BulkUploadHistoryList;
