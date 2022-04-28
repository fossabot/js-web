import Head from 'next/head';
import Link from 'next/link';
import { FC } from 'react';
import { AccessControl } from '../app-state/accessControl';
import { BACKEND_ADMIN_CONTROL } from '../constants/policies';
import WEB_PATHS from '../constants/webPaths';
import { AdminLayout } from '../layouts/admin.layout';
import Button from '../ui-kit/Button';
import ConfirmationModal from '../ui-kit/ConfirmationModal';
import ListSearch from '../ui-kit/ListSearch';
import { useVideoListPage } from './useVideoListPage';
import { VideoList } from './VideoList';

const sortOptions = [
  { label: 'Created date', value: 'createdAt' },
  { label: 'Title', value: 'title' },
  { label: 'File name', value: 'filename' },
  { label: 'Duration', value: 'duration' },
];

export const VideoListPage: FC<void> = () => {
  const {
    medias,
    totalPages,
    modalDelete,
    handleDeleteMedia,
    handleDeleteModal,
    media2Delete,
  } = useVideoListPage();

  return (
    <AccessControl
      policyNames={[
        BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
        BACKEND_ADMIN_CONTROL.ACCESS_VIDEO_MANAGEMENT,
      ]}
    >
      <AdminLayout>
        <Head>
          <title>Video Management</title>
        </Head>
        <section className="flex flex-row-reverse">
          <Link href={WEB_PATHS.VIDEO_MANAGEMENT_CREATE}>
            <a>
              <Button variant="primary" type="button" size="medium">
                Create
              </Button>
            </a>
          </Link>
        </section>
        <div className="mt-4">
          <ListSearch
            defaultSearchField="title"
            fieldOptions={[
              { label: 'Title', value: 'title' },
              { label: 'File name', value: 'filename' },
            ]}
            sortOptions={sortOptions}
          />
        </div>
        <VideoList
          medias={medias}
          totalPages={totalPages}
          onDelete={handleDeleteModal}
        />
        {media2Delete && (
          <ConfirmationModal
            isOpen={modalDelete.isOpen}
            toggle={modalDelete.toggle}
            header={'Delete Media'}
            body={`Permanently delete "${media2Delete.title}"?`}
            onOk={handleDeleteMedia}
          />
        )}
      </AdminLayout>
    </AccessControl>
  );
};
