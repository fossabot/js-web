import fileDownload from 'js-file-download';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import { AccessControl } from '../app-state/accessControl';
import API_PATHS from '../constants/apiPaths';
import { BACKEND_ADMIN_CONTROL } from '../constants/policies';
import WEB_PATHS from '../constants/webPaths';
import useList from '../hooks/useList';
import { centralHttp } from '../http';
import useTranslation from '../i18n/useTranslation';
import { AdminLayout } from '../layouts/admin.layout';
import DropdownButton from '../ui-kit/DropdownButton';
import { useModal } from '../ui-kit/Modal';
import DeleteOrganizationModal from './DeleteOrganizationModal';
import OrganizationList from './OrganizationList';

const OrganizationListPage = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { data, totalPages, fetchData } = useList<any>((options) => {
    return getOrganizationsPromise(options);
  });
  const [selectedOrgIds, setSelectedOrgIds] = useState([]);
  const [isSelectAll, setSelectAll] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isSelectAll) setSelectedOrgIds(data.map((o) => o.id));
    else setSelectedOrgIds([]);
  }, [isSelectAll]);
  const deleteOrganizationModalProps = useModal();

  async function onViewAction(organizationId: string) {
    router.push(WEB_PATHS.ORGANIZATION_DETAIL.replace(':id', organizationId));
  }

  const getOrganizationsPromise = (options?) => {
    return centralHttp.get(API_PATHS.ORGANIZATIONS, { params: options });
  };

  const deleteOrganization = async (organizationIds: string[]) => {
    const url = `${API_PATHS.ORGANIZATIONS}`;
    await centralHttp.delete(url, { data: { ids: organizationIds } });
  };

  const onDeleteAction = () => {
    deleteOrganizationModalProps.toggle();
  };

  const onConfirmDelete = async () => {
    try {
      setSubmitting(true);
      await deleteOrganization(selectedOrgIds);
      setSelectedOrgIds([]);
      fetchData();
    } catch (e) {
      console.log(e);
    } finally {
      setSubmitting(false);
    }
  };

  const onClickSelect = (organizationId: string) => {
    if (selectedOrgIds.includes(organizationId))
      setSelectedOrgIds(selectedOrgIds.filter((id) => id !== organizationId));
    else setSelectedOrgIds([...selectedOrgIds, organizationId]);
  };

  const onCsvDownload = async () => {
    const res = await centralHttp.get(API_PATHS.ORGANIZATIONS, {
      params: {
        format: 'csv',
        orderBy: 'name',
        order: 'ASC',
      },
      responseType: 'blob',
    });
    const filename = 'organizations.csv';
    fileDownload(res.data, filename);
  };

  return (
    <AccessControl
      policyNames={[
        BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
        BACKEND_ADMIN_CONTROL.ACCESS_ORGANIZATION_MANAGEMENT,
      ]}
    >
      <AdminLayout>
        <Head>
          <title>{t('headerText')} | Organization List</title>
        </Head>
        <div className="mx-6 text-right lg:mx-8">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex w-1/4">
              <h2 className="mb-2 py-2 text-left font-bold text-black">
                All organizations
              </h2>
            </div>
            <div className="flex w-3/4 flex-row items-center justify-end space-x-4 text-right">
              <button
                className="outline-none focus:outline-none w-2/6 cursor-pointer rounded bg-brand-primary py-2 px-4 font-bold text-white focus:ring"
                type="submit"
                onClick={() => {
                  router.push(WEB_PATHS.ORGANIZATION_ADD);
                }}
              >
                Add organization
              </button>
              <button
                className="outline-none focus:outline-none w-1/6 cursor-pointer rounded bg-brand-secondary py-2 px-4 font-bold text-white focus:ring"
                type="button"
                onClick={onCsvDownload}
              >
                Download CSV
              </button>
              <DropdownButton
                wrapperClassNames={'mx-1 w-2/6'}
                buttonName={'Actions'}
                menuItems={[
                  {
                    name: 'Delete Organization',
                    action: onDeleteAction,
                    isDisabled: selectedOrgIds.length < 1 || isSubmitting,
                    activeIcon: (
                      <FaTrash
                        className="mr-2 h-5 w-5 text-red-200"
                        aria-hidden="true"
                      />
                    ),
                    inactiveIcon: (
                      <FaTrash
                        className="mr-2 h-5 w-5 text-red-200"
                        aria-hidden="true"
                      />
                    ),
                  },
                ]}
              />
            </div>
          </div>
          <OrganizationList
            onViewAction={onViewAction}
            onDeleteAction={onDeleteAction}
            organizations={data}
            totalPages={totalPages}
            setSelectAll={setSelectAll}
            isSelectAll={isSelectAll}
            selectedOrgIds={selectedOrgIds}
            onClickSelect={onClickSelect}
          />
        </div>
        <DeleteOrganizationModal
          onDeleteAction={onConfirmDelete}
          isOpen={deleteOrganizationModalProps.isOpen}
          toggle={deleteOrganizationModalProps.toggle}
        />
      </AdminLayout>
    </AccessControl>
  );
};

export default OrganizationListPage;
