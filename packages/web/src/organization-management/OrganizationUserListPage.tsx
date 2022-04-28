import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FaTrash, FaUnlockAlt, FaUserMinus, FaUserPlus } from 'react-icons/fa';
import UserList from '../admin/UserList';
import API_PATHS from '../constants/apiPaths';
import useList from '../hooks/useList';
import { centralHttp } from '../http';
import AdminSettingApi from '../http/admin.setting.api';
import useTranslation from '../i18n/useTranslation';
import { AdminLayout } from '../layouts/admin.layout';
import DropdownButton from '../ui-kit/DropdownButton';
import { useModal } from '../ui-kit/HeadlessModal';
import RemoveOrganizationuserModal from './RemoveOrganizationUserModal';

const OrganizationUserListPage = ({ token }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { data, totalPages, fetchData } = useList<any>((options) => {
    return centralHttp.get(
      API_PATHS.ORGANIZATION_USERS.replace(':id', router.query.id as string),
      { params: options },
    );
  });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isSelectAll, setSelectAll] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const removeOrganizationUserModal = useModal();

  useEffect(() => {
    if (isSelectAll) setSelectedUsers(data.map((u) => u.id));
    else setSelectedUsers([]);
  }, [isSelectAll]);

  const onUnlockUsers = async () => {
    try {
      setSubmitting(true);
      await centralHttp.put(API_PATHS.ADMIN_UNLOCK_USERS, {
        ids: selectedUsers,
      });
      await fetchData();
    } catch (e) {
      console.log(e);
    } finally {
      setSubmitting(false);
    }
  };

  const onClickSelect = (userId: string) => {
    if (selectedUsers.includes(userId))
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    else setSelectedUsers([...selectedUsers, userId]);
  };

  const onActivateUser = async () => {
    try {
      setSubmitting(true);
      await AdminSettingApi.activateUsers(selectedUsers);
      await fetchData();
    } catch (e) {
      console.log(e);
    } finally {
      setSubmitting(false);
    }
  };

  const onDeactivateUser = async () => {
    try {
      setSubmitting(true);
      await AdminSettingApi.deactivateUsers(selectedUsers);
      await fetchData();
    } catch (e) {
      console.log(e);
    } finally {
      setSubmitting(false);
    }
  };

  const onRemoveUserFromOrganization = async () => {
    try {
      setSubmitting(true);
      await centralHttp.delete(
        API_PATHS.ORGANIZATION_USERS.replace(':id', router.query.id as string),
        {
          data: { ids: selectedUsers },
        },
      );
      await fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
      removeOrganizationUserModal.toggle(false);
    }
  };

  const handleRowUpdated = () => {
    fetchData();
  };

  return (
    <AdminLayout>
      <Head>
        <title>{t('headerText')} | Organization user list</title>
      </Head>
      <RemoveOrganizationuserModal
        {...{
          ...removeOrganizationUserModal,
          onConfirm: onRemoveUserFromOrganization,
        }}
      />
      <div className="mx-auto text-right">
        <div className="align-items-start flex justify-between">
          <h2 className="mb-2 py-2 text-left font-bold text-black">
            Organization users
          </h2>
          <DropdownButton
            wrapperClassNames={'mx-1 w-1/4'}
            buttonName={'Actions'}
            menuItems={[
              {
                name: 'Activate account',
                action: onActivateUser,
                isDisabled: selectedUsers.length < 1 || isSubmitting,
                activeIcon: (
                  <FaUserPlus
                    className="mr-2 h-5 w-5 text-green-200"
                    aria-hidden="true"
                  />
                ),
                inactiveIcon: (
                  <FaUserPlus
                    className="mr-2 h-5 w-5 text-green-200"
                    aria-hidden="true"
                  />
                ),
              },
              {
                name: 'Deactivate account',
                action: onDeactivateUser,
                isDisabled: selectedUsers.length < 1 || isSubmitting,
                activeIcon: (
                  <FaUserMinus
                    className="mr-2 h-5 w-5 text-red-200"
                    aria-hidden="true"
                  />
                ),
                inactiveIcon: (
                  <FaUserMinus
                    className="mr-2 h-5 w-5 text-red-200"
                    aria-hidden="true"
                  />
                ),
              },
              {
                name: 'Unlock account',
                action: onUnlockUsers,
                isDisabled: selectedUsers.length < 1 || isSubmitting,
                activeIcon: (
                  <FaUnlockAlt
                    className="mr-2 h-5 w-5 text-gray-500"
                    aria-hidden="true"
                  />
                ),
                inactiveIcon: (
                  <FaUnlockAlt
                    className="mr-2 h-5 w-5 text-gray-500"
                    aria-hidden="true"
                  />
                ),
              },
              {
                name: 'Remove users',
                action: () => removeOrganizationUserModal.toggle(true),
                isDisabled: selectedUsers.length < 1 || isSubmitting,
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
        <UserList
          currentUserId={token?.user?.id}
          users={data}
          totalPages={totalPages}
          isSelectAll={isSelectAll}
          selectedUsers={selectedUsers}
          onClickSelect={onClickSelect}
          setSelectAll={setSelectAll}
          handleRowUpdated={handleRowUpdated}
        />
      </div>
    </AdminLayout>
  );
};

export default OrganizationUserListPage;
