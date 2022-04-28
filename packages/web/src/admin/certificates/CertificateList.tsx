import { format, parseISO } from 'date-fns';
import { FaDownload, FaEdit, FaEye, FaTrash } from 'react-icons/fa';
import { ICertificate } from '../../models/certificate';
import Button from '../../ui-kit/Button';
import ListSearch, { IListSearch } from '../../ui-kit/ListSearch';
import Pagination from '../../ui-kit/Pagination';
import { TableColumn, TableHead } from '../../ui-kit/Table';

const fieldOptions: IListSearch['fieldOptions'] = [
  {
    label: 'Title',
    value: 'title',
  },
  {
    label: 'Provider',
    value: 'provider',
  },
];

const sortOptions: IListSearch['sortOptions'] = [
  { label: 'Created Date', value: 'createdAt' },
  { label: 'Title', value: 'title' },
];

interface ICertificateListProps {
  totalPages: number;
  certificates: ICertificate[];
  onDeleteAction: (id: ICertificate['id']) => void;
  onClickEdit: (certificate: ICertificate) => void;
  onDownloadCertificate: (certificate: ICertificate) => void;
  onPreviewCertificate: (certificate: ICertificate) => void;
}

const renderUploader = (uploader: ICertificate['uploader']) => {
  let render = uploader.email;
  if (uploader.firstName) {
    render = uploader.firstName;
    if (uploader.lastName) {
      render += ' ' + uploader.lastName;
    }
  }

  return render;
};

export const CertificateList = ({
  totalPages,
  certificates,
  onClickEdit,
  onDeleteAction,
  onDownloadCertificate,
  onPreviewCertificate,
}: ICertificateListProps) => {
  return (
    <>
      <ListSearch
        defaultSearchField="name"
        fieldOptions={fieldOptions}
        sortOptions={sortOptions}
      />
      <div className="my-4 overflow-x-scroll rounded bg-white shadow-md">
        <table className="w-full table-auto border-collapse border text-left">
          <thead>
            <tr>
              <TableHead className="w-2/12">Title</TableHead>
              <TableHead className="w-1/12">Orientation</TableHead>
              <TableHead className="w-1/12">Provider</TableHead>
              <TableHead className="w-1/12">File name</TableHead>
              <TableHead className="w-1/12">Created at</TableHead>
              <TableHead className="w-1/12">Created by</TableHead>
              <TableHead>Edit</TableHead>
              <TableHead>Download</TableHead>
              <TableHead>Preview</TableHead>
              <TableHead>Delete</TableHead>
            </tr>
          </thead>
          <tbody className="w-full">
            {certificates.length > 0 ? (
              certificates.map((certificate) => {
                return (
                  <tr className="hover:bg-gray-100" key={certificate.id}>
                    <TableColumn>{certificate.title}</TableColumn>
                    <TableColumn className="capitalize">
                      {certificate.orientation}
                    </TableColumn>
                    <TableColumn className="capitalize">
                      {certificate.provider}
                    </TableColumn>
                    <TableColumn>{certificate.filename}</TableColumn>
                    <TableColumn>
                      {format(
                        parseISO(certificate.createdAt),
                        'dd/MM/yyyy HH:mm:ss',
                      )}
                    </TableColumn>
                    <TableColumn>
                      {renderUploader(certificate.uploader)}
                    </TableColumn>
                    <TableColumn>
                      <Button
                        type="button"
                        variant="primary"
                        size="medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          onClickEdit(certificate);
                        }}
                      >
                        <FaEdit />
                      </Button>
                    </TableColumn>
                    <TableColumn>
                      <Button
                        type="button"
                        variant="primary"
                        size="medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownloadCertificate(certificate);
                        }}
                      >
                        <FaDownload />
                      </Button>
                    </TableColumn>
                    <TableColumn>
                      <Button
                        type="button"
                        variant="primary"
                        size="medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPreviewCertificate(certificate);
                        }}
                      >
                        <FaEye />
                      </Button>
                    </TableColumn>
                    <TableColumn>
                      <Button
                        type="button"
                        variant="primary"
                        size="medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteAction(certificate.id);
                        }}
                      >
                        <FaTrash />
                      </Button>
                    </TableColumn>
                  </tr>
                );
              })
            ) : (
              <tr className="text-center hover:bg-gray-100">
                <TableColumn colSpan={10}>No records found!</TableColumn>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 0 && <Pagination totalPages={totalPages} />}
    </>
  );
};
