import Head from 'next/head';
import Link from 'next/link';
import { FC } from 'react';
import { AccessControl } from '../app-state/accessControl';
import { BACKEND_ADMIN_CONTROL } from '../constants/policies';
import WEB_PATHS from '../constants/webPaths';
import { AdminLayout } from '../layouts/admin.layout';
import Button from '../ui-kit/Button';
import ListSearch from '../ui-kit/ListSearch';
import DeleteMaterialModal from './DeleteMaterialModal';
import { MaterialList } from './MaterialList';
import { useMaterialListPage } from './useMaterialListPage';

const sortOptions = [
  { label: 'Created Date', value: 'createdAt' },
  { label: 'Display name', value: 'displayName' },
];

const MaterialListPage: FC<any> = () => {
  const {
    data,
    totalPages,
    handleDownload,
    modalDelete,
    handleDeleteMaterial,
  } = useMaterialListPage();

  return (
    <AccessControl
      policyNames={[
        BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
        BACKEND_ADMIN_CONTROL.ACCESS_MATERIAL_MANAGEMENT,
      ]}
    >
      <AdminLayout>
        <Head>
          <title>List Materials</title>
        </Head>
        <section className="flex flex-row-reverse">
          <Link href={WEB_PATHS.MATERIALS_CREATE}>
            <a>
              <Button variant="primary" type="button" size="medium">
                Create
              </Button>
            </a>
          </Link>
        </section>
        <div className="mt-4">
          <ListSearch
            defaultSearchField="displayName"
            fieldOptions={[
              { label: 'Display name', value: 'displayName' },
              { label: 'File name', value: 'filename' },
            ]}
            sortOptions={sortOptions}
          />
        </div>
        <MaterialList
          materials={data}
          totalPages={totalPages}
          onDownload={handleDownload}
          onDelete={modalDelete.toggle}
        />
        <DeleteMaterialModal
          isOpen={modalDelete.isOpen}
          toggle={modalDelete.toggle}
          onDeleteAction={handleDeleteMaterial}
        />
      </AdminLayout>
    </AccessControl>
  );
};

export default MaterialListPage;
