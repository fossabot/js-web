import { FC } from 'react';
import { Media } from '../models/media';
import { TableColumn, TableHead } from '../ui-kit/Table';
import Pagination from '../ui-kit/Pagination';
import { format, parseISO } from 'date-fns';
import WEB_PATHS from '../constants/webPaths';
import Link from 'next/link';
import Button from '../ui-kit/Button';
import { FaEdit, FaTrash } from 'react-icons/fa';

export interface IVideoList {
  medias: Media[];
  totalPages: number;
  onDelete: (media: Media) => any;
}

export const VideoList: FC<IVideoList> = (props) => {
  const { medias, totalPages, onDelete } = props;

  return (
    <>
      <div className="my-4 overflow-x-scroll rounded bg-white shadow-md">
        <table className="w-full table-auto border-collapse border text-left">
          <thead>
            <tr>
              <TableHead>Title</TableHead>
              <TableHead>File name</TableHead>
              <TableHead>Duration (seconds)</TableHead>
              <TableHead className="w-1/6">Created at</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-1/8">Edit</TableHead>
              <TableHead className="w-1/8">Delete</TableHead>
            </tr>
          </thead>
          <tbody className="w-full">
            {medias.map((media) => (
              <tr key={media.id} className="hover:bg-gray-100">
                <TableColumn>{media.title}</TableColumn>
                <TableColumn>{media.filename}</TableColumn>
                <TableColumn>{media.duration}</TableColumn>
                <TableColumn>
                  {format(parseISO(media.createdAt), 'dd/MM/yyyy HH:mm:ss')}
                </TableColumn>
                <TableColumn>{media.status}</TableColumn>
                <TableColumn>
                  <Link
                    href={WEB_PATHS.VIDEO_MANAGEMENT_DETAIL.replace(
                      ':id',
                      media.id,
                    )}
                  >
                    <a>
                      <Button variant="primary" size="medium" type="button">
                        <FaEdit />
                      </Button>
                    </a>
                  </Link>
                </TableColumn>
                <TableColumn>
                  <Button
                    variant="primary"
                    size="medium"
                    type="button"
                    onClick={() => onDelete(media)}
                  >
                    <FaTrash />
                  </Button>
                </TableColumn>
              </tr>
            ))}
            {medias.length <= 0 && (
              <tr className="text-center hover:bg-gray-100">
                <TableColumn colSpan={4}>No records found!</TableColumn>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 0 && <Pagination totalPages={totalPages} />}
    </>
  );
};
