import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import {
  FaObjectGroup,
  FaUnlockAlt,
  FaUserMinus,
  FaUserPlus,
} from 'react-icons/fa';
import { AccessControl } from '../app-state/accessControl';
import API_PATHS from '../constants/apiPaths';
import { BACKEND_ADMIN_CONTROL } from '../constants/policies';
import WEB_PATHS from '../constants/webPaths';
import useList from '../hooks/useList';
import { centralHttp } from '../http';
import AdminSettingApi from '../http/admin.setting.api';
import useTranslation from '../i18n/useTranslation';
import { AdminLayout } from '../layouts/admin.layout';
import Button from '../ui-kit/Button';
import DropdownButton from '../ui-kit/DropdownButton';
import ListSearch from '../ui-kit/ListSearch';
import AllUserList from './UserList';

const sortOptions = [
  { label: 'Created Date', value: 'createdAt' },
  { label: 'First Name', value: 'firstName' },
  { label: 'Last Name', value: 'lastName' },
  { label: 'Email', value: 'email' },
];

const AllUsersSection = ({ token }) => {
  const router = useRouter();
  const { data, totalPages, fetchData } = useList<any>((options) => {
    return centralHttp.get(API_PATHS.ADMIN_USERS, { params: options });
  });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isSelectAll, setSelectAll] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);

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

  const handleRowUpdated = () => {
    fetchData();
  };

  return (
    <div className="mx-auto w-10/12 text-right">
      <div className="mb-4 flex flex-col items-center justify-between lg:flex-row">
        <div className="flex w-full lg:w-1/4">
          <h2 className="mb-2 py-2 text-left text-xl font-bold text-black">
            All users
          </h2>
        </div>
        <div className="flex w-full flex-col items-center justify-end text-right lg:w-2/5 lg:flex-row">
          <div className="w-full lg:w-1/2">
            <Button
              type="button"
              variant="primary"
              size="medium"
              onClick={() => router.push(WEB_PATHS.ADMIN_ADD_USER)}
            >
              Create
            </Button>
          </div>
          <DropdownButton
            wrapperClassNames={'mt-4 lg:mt-0 lg:ml-4 w-full lg:w-1/2'}
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
                name: 'Manage role policies',
                action: () =>
                  router.push(WEB_PATHS.ADMIN_ROLE_POLICY_MANAGEMENT),
                isDisabled: isSubmitting,
                activeIcon: (
                  <FaObjectGroup
                    className="mr-2 h-5 w-5 text-green-200"
                    aria-hidden="true"
                  />
                ),
                inactiveIcon: (
                  <FaObjectGroup
                    className="mr-2 h-5 w-5 text-green-200"
                    aria-hidden="true"
                  />
                ),
              },
            ]}
          />
        </div>
      </div>
      <ListSearch
        defaultSearchField="firstName"
        fieldOptions={[
          { label: 'First Name', value: 'firstName' },
          { label: 'Last Name', value: 'lastName' },
          { label: 'Email', value: 'email' },
        ]}
        sortOptions={sortOptions}
      />
      <AllUserList
        currentUserId={token?.user?.id}
        users={data}
        totalPages={totalPages}
        onClickSelect={onClickSelect}
        isSelectAll={isSelectAll}
        setSelectAll={setSelectAll}
        selectedUsers={selectedUsers}
        handleRowUpdated={handleRowUpdated}
      />
    </div>
  );
};

const UserManagement = ({ token }) => {
  const { t } = useTranslation();

  return (
    <AccessControl
      policyNames={[
        BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
        BACKEND_ADMIN_CONTROL.ACCESS_USER_MANAGEMENT,
      ]}
    >
      <AdminLayout>
        <Head>
          <title>{t('headerText')} | User Management</title>
        </Head>
        <AllUsersSection token={token} />
      </AdminLayout>
    </AccessControl>
  );
};

export default UserManagement;
