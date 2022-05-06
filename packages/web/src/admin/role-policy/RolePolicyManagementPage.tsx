import { uniq } from 'lodash';
import Head from 'next/head';
import { useCallback, useMemo, useState } from 'react';
import {
  FaEdit,
  FaPlus,
  FaTrash,
  FaTrashAlt,
  FaTrashRestore,
  FaTrashRestoreAlt,
} from 'react-icons/fa';
import { AccessControl } from '../../app-state/accessControl';
import API_PATHS from '../../constants/apiPaths';
import { BACKEND_ADMIN_CONTROL } from '../../constants/policies';
import useList from '../../hooks/useList';
import { centralHttp } from '../../http';
import useTranslation from '../../i18n/useTranslation';
import { AdminLayout } from '../../layouts/admin.layout';
import { BaseResponseDto } from '../../models/BaseResponse.dto';
import { Policy, Role } from '../../models/role';
import { IListSearch } from '../../ui-kit/ListSearch';
import { useModal } from '../../ui-kit/Modal';
import ThreePane from '../../ui-kit/three-pane-design/ThreePane';
import { IThreePaneLeftPane } from '../../ui-kit/three-pane-design/ThreePaneLeftPane';
import { IThreePaneRightPane } from '../../ui-kit/three-pane-design/ThreePaneRightPane';
import { IThreePaneTopPane } from '../../ui-kit/three-pane-design/ThreePaneTopPane';
import { getErrorMessages } from '../../utils/error';
import AddPoliciesToRoleModal from './AddPoliciesToRoleModal';
import AddRoleModal from './AddRoleModal';
import RemovePoliciesFromRoleModal from './RemovePoliciesFromRoleModal';
import RemoveRoleModal from './RemoveRoleModal';

const fieldOptions: IListSearch['fieldOptions'] = [
  {
    label: 'Role name',
    value: 'name',
  },
];

const sortOptions: IListSearch['sortOptions'] = [
  { label: 'Role name', value: 'name' },
  { label: 'Created Date', value: 'createdAt' },
  { label: 'Updated Date', value: 'updatedAt' },
];

export const RolePolicyManagementPage = () => {
  const { t } = useTranslation();

  const { data, totalPages, fetchData } = useList<Role>((params) =>
    centralHttp.get(API_PATHS.ROLES, { params }),
  );

  const [errors, setErrors] = useState<string[]>();
  const [currentRole, setCurrentRole] = useState<Role | null>(null);

  const [checkedRows, setCheckedRows] = useState<Role['id'][]>([]);

  const addRoleModal = useModal();
  const updateRoleModal = useModal();
  const removeRoleModal = useModal();
  const addPoliciesModal = useModal();
  const removePoliciesModal = useModal();

  const handleError = (error) => {
    const msgs = getErrorMessages(error);
    setErrors(msgs);
  };

  const fetchRoleDetail = useCallback(async (id: Role['id']) => {
    try {
      setCheckedRows([]);
      const res = await centralHttp.get<BaseResponseDto<Role>>(
        API_PATHS.ROLE_BY_ID.replace(':id', id),
        { params: { withPolicies: true } },
      );
      setCurrentRole(res.data.data);
    } catch (err) {
      handleError(err);
      console.error(err);
    }
  }, []);

  const topPaneProps = useMemo<IThreePaneTopPane>(() => {
    return {
      sortOptions,
      fieldOptions,
      errors,
      setErrors,
      headingText: currentRole
        ? `${t('rolePolicyManagementPage.headingText')} - ${currentRole.name}`
        : t('rolePolicyManagementPage.headingText'),
      menuItems: [
        {
          name: t('rolePolicyManagementPage.updateRole'),
          isDisabled: !currentRole,
          action: () => updateRoleModal.toggle(),
          activeIcon: (
            <FaEdit className="mr-2 h-5 w-5 text-gray-600" aria-hidden="true" />
          ),
          inactiveIcon: (
            <FaEdit className="mr-2 h-5 w-5 text-gray-500" aria-hidden="true" />
          ),
        },
        {
          name: t('rolePolicyManagementPage.removeRole'),
          isDisabled: !currentRole || currentRole.isSystemDefined,
          action: () => removeRoleModal.toggle(),
          activeIcon: (
            <FaTrashAlt
              className="mr-2 h-5 w-5 text-red-200"
              aria-hidden="true"
            />
          ),
          inactiveIcon: (
            <FaTrashRestoreAlt
              className="mr-2 h-5 w-5 text-red-200"
              aria-hidden="true"
            />
          ),
        },
        {
          name: t('rolePolicyManagementPage.addPolicies'),
          isDisabled: !currentRole,
          action: () => addPoliciesModal.toggle(),
          activeIcon: (
            <FaPlus
              className="mr-2 h-5 w-5 text-green-300"
              aria-hidden="true"
            />
          ),
          inactiveIcon: (
            <FaPlus
              className="mr-2 h-5 w-5 text-green-200"
              aria-hidden="true"
            />
          ),
        },
        {
          name: t('rolePolicyManagementPage.removePolicies'),
          isDisabled: checkedRows.length === 0,
          action: () => removePoliciesModal.toggle(),
          activeIcon: (
            <FaTrash className="mr-2 h-5 w-5 text-red-200" aria-hidden="true" />
          ),
          inactiveIcon: (
            <FaTrashRestore
              className="mr-2 h-5 w-5 text-red-200"
              aria-hidden="true"
            />
          ),
        },
      ],
    };
  }, [
    errors,
    currentRole,
    t,
    checkedRows.length,
    updateRoleModal,
    removeRoleModal,
    addPoliciesModal,
    removePoliciesModal,
  ]);

  const leftPaneProps = useMemo<IThreePaneLeftPane<Role, Role>>(() => {
    return {
      onClickAdd: addRoleModal.toggle,
      addButtonLabel: t('rolePolicyManagementPage.addRole'),
      data,
      current: currentRole,
      render: (role) => role.name,
      emptyLabel: t('rolePolicyManagementPage.noRole'),
      totalPages,
      fetchDetail: fetchRoleDetail,
    };
  }, [addRoleModal.toggle, t, data, currentRole, totalPages, fetchRoleDetail]);

  const rightPaneProps = useMemo<IThreePaneRightPane<Policy>>(() => {
    return {
      list: currentRole ? currentRole.policies || [] : [],
      checkedRows,
      setCheckedRows,
      emptyText: t('rolePolicyManagementPage.noPolicy'),
      columns: [
        {
          label: 'Policy name',
          dataKey: 'name',
          width: 300,
        },
        {
          label: 'Policy description',
          dataKey: 'description',
          width: 600,
        },
      ],
    };
  }, [checkedRows, currentRole, t]);

  const onCreateRole = async (name: string) => {
    try {
      const { data } = await centralHttp.post(API_PATHS.ROLES, { name });
      await Promise.all([fetchData(), fetchRoleDetail(data.data.id)]);
    } catch (e) {
      handleError(e);
      console.error();
    }
  };

  const onUpdateRole = async (name: string) => {
    try {
      await centralHttp.put(
        API_PATHS.ROLE_BY_ID.replace(':id', currentRole.id),
        { name },
      );
      await Promise.all([fetchData(), fetchRoleDetail(currentRole.id)]);
    } catch (e) {
      handleError(e);
      console.error();
    }
  };

  const onDeleteRole = async () => {
    try {
      await centralHttp.delete(
        API_PATHS.ROLE_BY_ID.replace(':id', currentRole.id),
      );
      setCurrentRole(null);
      await fetchData();
    } catch (e) {
      handleError(e);
      console.error();
    } finally {
      removeRoleModal.toggle();
    }
  };

  const onAddPoliciesToRole = async (policyIds: Policy['id'][]) => {
    if (!currentRole) return;

    try {
      const body = {
        policyIds: uniq([
          ...policyIds,
          ...currentRole.policies.map((p) => p.id),
        ]),
      };

      await centralHttp.put(
        API_PATHS.UPDATE_ROLE_POLICIES.replace(':id', currentRole.id),
        body,
      );

      await fetchRoleDetail(currentRole.id);
      addPoliciesModal.toggle();
    } catch (err) {
      handleError(err);
      console.error(err);
    }
  };

  const onRemovePoliciesFromRole = async () => {
    if (!currentRole) return;

    try {
      const body = {
        policyIds: currentRole.policies
          .map((p) => p.id)
          .filter((id) => !checkedRows.includes(id)),
      };

      await centralHttp.put(
        API_PATHS.UPDATE_ROLE_POLICIES.replace(':id', currentRole.id),
        body,
      );

      await fetchRoleDetail(currentRole.id);
      removePoliciesModal.toggle();
    } catch (err) {
      handleError(err);
      console.error(err);
    }
  };

  return (
    <AccessControl
      policyNames={[
        BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
        BACKEND_ADMIN_CONTROL.ACCESS_USER_MANAGEMENT,
      ]}
    >
      <AdminLayout>
        <Head>
          <title>
            {t('headerText')} | {t('rolePolicyManagementPage.metaTitle')}
          </title>
        </Head>
        <ThreePane
          topPane={topPaneProps}
          leftPane={leftPaneProps}
          rightPane={rightPaneProps}
        />
      </AdminLayout>
      <AddRoleModal
        {...{
          ...addRoleModal,
          headingText: t('rolePolicyManagementPage.addRole'),
          onSubmit: onCreateRole,
        }}
      />
      <AddRoleModal
        {...{
          ...updateRoleModal,
          headingText: t('rolePolicyManagementPage.updateRole'),
          onSubmit: onUpdateRole,
        }}
      />
      <RemoveRoleModal
        {...{
          ...removeRoleModal,
          name: currentRole?.name,
          onConfirm: onDeleteRole,
        }}
      />
      <AddPoliciesToRoleModal
        {...{
          ...addPoliciesModal,
          headingText: `${t('rolePolicyManagementPage.addPolicyToRole')} - ${
            currentRole?.name
          }`,
          onSubmit: onAddPoliciesToRole,
        }}
      />
      <RemovePoliciesFromRoleModal
        {...{
          ...removePoliciesModal,
          headerText: `${t(
            'rolePolicyManagementPage.removePoliciesConfirm',
          )} - ${currentRole?.name}`,
          onConfirm: onRemovePoliciesFromRole,
        }}
      />
    </AccessControl>
  );
};
