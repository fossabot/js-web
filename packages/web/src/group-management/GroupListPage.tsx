import Head from 'next/head';
import cloneDeep from 'lodash/cloneDeep';
import fileDownload from 'js-file-download';
import { useEffect, useState } from 'react';
import {
  FaArrowDown,
  FaArrowUp,
  FaEye,
  FaEyeSlash,
  FaTrash,
  FaTrashRestore,
  FaUserMinus,
  FaUserPlus,
} from 'react-icons/fa';
import TreeModel from 'tree-model';

import { AccessControl } from '../app-state/accessControl';
import API_PATHS from '../constants/apiPaths';
import { BACKEND_ADMIN_CONTROL } from '../constants/policies';
import { centralHttp } from '../http';
import AdminSettingApi from '../http/admin.setting.api';
import useTranslation from '../i18n/useTranslation';
import { AdminLayout } from '../layouts/admin.layout';
import { BaseResponseDto } from '../models/BaseResponse.dto';
import { IGroup } from '../models/group';
import DropdownButton from '../ui-kit/DropdownButton';
import { useModal } from '../ui-kit/Modal';
import VirtualizedTable from '../ui-kit/VirtualizedTable';
import { flatten } from '../utils/array';
import { captureError } from '../utils/error-routing';
import AddGroupModal from './AddGroupModal';
import AddUserToGroupModal from './AddUserToGroupModal';
import GroupItems from './GroupItems';
import GroupUserTable from './GroupUserTable';

const GroupListPage = ({ token }) => {
  const { t } = useTranslation();
  const addGroupModalProps = useModal();
  const addUserGroupModalProps = useModal();

  const [groups, setGroups] = useState<IGroup[]>([]);
  const [groupUsers, setGroupUsers] = useState([]);
  const [checkedRows, setCheckedRows] = useState([]);
  const [selectedGroup, setSelectedGroup] =
    useState<Pick<
      IGroup,
      'id' | 'name' | 'showOnlySubscribedCourses' | 'disableUpgrade'
    > | null>(null);

  async function getGroups() {
    try {
      const response = await centralHttp.get<BaseResponseDto<IGroup[]>>(
        API_PATHS.GROUPS,
      );
      const groupsResponse = response.data.data;

      setGroups(groupsResponse.map((g) => ({ ...g, children: [] })));

      if (groupsResponse?.length > 0 && selectedGroup === null) {
        const firstGroup = groupsResponse[0];
        setSelectedGroup({
          id: firstGroup.id,
          name: firstGroup.name,
          showOnlySubscribedCourses: firstGroup.showOnlySubscribedCourses,
          disableUpgrade: firstGroup.disableUpgrade,
        });
      }

      return groupsResponse;
    } catch (error) {
      captureError(error);
    }
  }

  async function onGroupClick({
    id,
    name,
    parentId,
    showOnlySubscribedCourses,
    disableUpgrade,
  }: IGroup) {
    if (parentId) {
      setSelectedGroup({ id, name, showOnlySubscribedCourses, disableUpgrade });
      return;
    }

    const response = await centralHttp.get(
      API_PATHS.GROUP_DESCENDANTS.replace(':id', id),
    );
    const groupDescendants = response.data.data;

    const groupsTree = new TreeModel();
    const groupsRoot = groupsTree.parse({
      id: 'root-id',
      name: 'root',
      parentId: null,
      showOnlySubscribedCourses: false,
      disableUpgrade: false,
      children: cloneDeep(groups),
    });
    const parentNode = groupsRoot.first(function (node) {
      return node.model.id === id;
    });

    groupDescendants.forEach((gd) => {
      const gdt = new TreeModel();
      const gdr = gdt.parse(gd);
      const existing = parentNode.first((node) => node.model.id === gd.id);

      if (!existing) {
        parentNode.addChild(gdr);
      }
    });

    setGroups(groupsRoot.model.children);
    setSelectedGroup({ id, name, showOnlySubscribedCourses, disableUpgrade });
    window.scroll({ top: 0, left: 0, behavior: 'smooth' });
  }

  async function getGroupUsers(groupId: string) {
    try {
      const response = await centralHttp.get(
        API_PATHS.GROUP_USERS.replace(':id', groupId),
      );
      setGroupUsers(response.data.data);

      if (
        flatten(groups, 'children').find((g) => g.id === groupId)?.children
          .length > 0
      ) {
        const desResponse = await centralHttp.get(
          API_PATHS.GROUP_DESCENDANT_USERS.replace(':id', groupId),
        );
        const des = desResponse.data.data || [];

        setGroupUsers(response.data.data.concat(des));
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function onGroupAdd({
    name,
    parentGroupId: parentId,
  }: {
    name: string;
    parentGroupId: string;
  }) {
    try {
      const addedResponse = await centralHttp.post(API_PATHS.GROUPS, {
        name,
        parentId,
      });
      const addedGroup = addedResponse.data.data;
      addedGroup.children = [];

      const groupsTree = new TreeModel();
      const groupsRoot = groupsTree.parse({
        id: 'root-id',
        children: cloneDeep(groups),
        name: 'root',
        parentId: null,
        showOnlySubscribedCourses: false,
        disableUpgrade: false,
      });
      const parentNode = groupsRoot.first(function (node) {
        return node.model.id === parentId;
      });

      const addedGroupTree = new TreeModel();
      const addedGroupRoot = addedGroupTree.parse(addedGroup);

      parentNode.addChild(addedGroupRoot);

      setGroups(groupsRoot.model.children);

      setSelectedGroup({
        id: addedGroup.id,
        name: addedGroup.name,
        showOnlySubscribedCourses: false,
        disableUpgrade: false,
      });
    } catch (error) {
      console.error(error);
    }
  }

  async function onUserAddToGroup({
    userId,
    groupId,
  }: {
    userId: string;
    groupId: string;
  }) {
    try {
      await centralHttp.post(
        API_PATHS.ADD_USER_TO_GROUP.replace(':id', groupId).replace(
          ':userId',
          userId,
        ),
        {},
      );

      await getGroupUsers(selectedGroup.id);
    } catch (error) {
      console.error(error);
    }
  }

  async function deleteSelectedUsersFromGroup() {
    if (checkedRows.length < 1 || !selectedGroup.id) return;

    await centralHttp.post(API_PATHS.BULK_DELETE_GROUP_USERS, {
      ids: checkedRows,
    });
    await getGroupUsers(selectedGroup.id);
  }

  async function deleteGroup() {
    if (!selectedGroup.id) return;

    await centralHttp.delete(
      API_PATHS.DELETE_GROUP.replace(':id', selectedGroup.id),
    );

    const groupsTree = new TreeModel();
    const groupsRoot = groupsTree.parse({
      id: 'root-id',
      children: cloneDeep(groups),
      name: 'root',
      parentId: null,
      showOnlySubscribedCourses: false,
      disableUpgrade: false,
    });
    const nodeToRemove = groupsRoot.first(
      (node) => node.model.id === selectedGroup.id,
    );

    nodeToRemove.drop();

    setGroups(groupsRoot.model.children);

    const firstGroup = groups[0];

    if (!firstGroup) {
      setSelectedGroup(null);
      setGroupUsers([]);

      return;
    }

    setSelectedGroup({
      id: firstGroup.id,
      name: firstGroup.name,
      showOnlySubscribedCourses: firstGroup.showOnlySubscribedCourses,
      disableUpgrade: firstGroup.disableUpgrade,
    });
  }

  async function toggleGroupState(
    key: 'showOnlySubscribedCourses' | 'disableUpgrade',
  ) {
    if (!selectedGroup.id) return;

    const body: { [key: string]: any } = {};

    if (key === 'showOnlySubscribedCourses') {
      body.showOnlySubscribedCourses = !selectedGroup.showOnlySubscribedCourses;
    }
    if (key === 'disableUpgrade') {
      body.disableUpgrade = !selectedGroup.disableUpgrade;
    }

    await centralHttp.put(
      API_PATHS.GROUP_ID.replace(':id', selectedGroup.id),
      body,
    );
    setSelectedGroup((group) => ({
      ...group,
      ...body,
    }));

    const groupsTree = new TreeModel();
    const groupsRoot = groupsTree.parse({
      id: 'root-id',
      children: cloneDeep(groups),
      name: 'root',
      parentId: null,
      showOnlySubscribedCourses: false,
      disableUpgrade: false,
    });

    const selectedGroupNode = groupsRoot.first(
      (node) => node.model.id === selectedGroup.id,
    );

    if (key === 'showOnlySubscribedCourses') {
      selectedGroupNode.model.showOnlySubscribedCourses =
        !selectedGroupNode.model.showOnlySubscribedCourses;
    }
    if (key === 'disableUpgrade') {
      selectedGroupNode.model.disableUpgrade =
        !selectedGroupNode.model.disableUpgrade;
    }

    setGroups(groupsRoot.model.children);
  }

  async function activateAccount() {
    if (checkedRows.length < 1 || !selectedGroup.id) return;

    const userIds = groupUsers
      .filter((gu) => checkedRows.includes(gu.id))
      .map((fgu) => fgu.user.id);

    await AdminSettingApi.activateUsers(userIds);
    await getGroupUsers(selectedGroup.id);
  }

  async function deactivateAccount() {
    if (checkedRows.length < 1 || !selectedGroup.id) return;

    const userIds = groupUsers
      .filter((gu) => checkedRows.includes(gu.id))
      .map((fgu) => fgu.user.id);

    await AdminSettingApi.deactivateUsers(userIds);
    await getGroupUsers(selectedGroup.id);
  }

  async function onDownloadCsv() {
    const res = await centralHttp.get(API_PATHS.DOWNLOAD_GROUP_CSV, {
      responseType: 'blob',
    });
    const filename = 'groups.csv';

    fileDownload(res.data, filename);
  }

  useEffect(() => {
    getGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup && selectedGroup.id) {
      setCheckedRows([]);
      getGroupUsers(selectedGroup.id);
    }
  }, [selectedGroup && selectedGroup.id]);

  return (
    <AccessControl
      policyNames={[
        BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
        BACKEND_ADMIN_CONTROL.ACCESS_GROUP_MANAGEMENT,
      ]}
    >
      <AdminLayout>
        <Head>
          <title>{t('headerText')} | Group Management</title>
        </Head>
        <AddGroupModal
          groups={groups}
          onAddAction={onGroupAdd}
          selectedGroup={selectedGroup}
          isOpen={addGroupModalProps.isOpen}
          toggle={addGroupModalProps.toggle}
        />
        <AddUserToGroupModal
          groups={groups}
          selectedGroup={selectedGroup}
          onAddAction={onUserAddToGroup}
          isOpen={addUserGroupModalProps.isOpen}
          toggle={addUserGroupModalProps.toggle}
        />
        <div className="w-full p-6 lg:p-8">
          <div className="flex items-center justify-between">
            <div className="px-2 py-2">
              <h2 className="mb-2 py-2 text-left text-xl font-bold text-black">
                Groups{' '}
                {selectedGroup && selectedGroup.name
                  ? '> ' + selectedGroup.name
                  : ''}
              </h2>
            </div>
            <div className="flex flex-row space-x-4 px-2 py-2">
              <button
                disabled={groups.length < 1}
                onClick={addUserGroupModalProps.toggle}
                className="outline-none focus:outline-none mx-1 cursor-pointer rounded bg-white py-2 px-4 font-bold text-black shadow-lg focus:ring disabled:opacity-50"
              >
                Add user
              </button>
              <button
                onClick={onDownloadCsv}
                className="outline-none focus:outline-none mx-1 cursor-pointer rounded bg-white py-2 px-4 font-bold text-black shadow-lg focus:ring disabled:opacity-50"
              >
                Download CSV
              </button>
              <DropdownButton
                wrapperClassNames={'mx-1'}
                buttonName={'Actions'}
                menuItems={[
                  {
                    name: 'Remove selected users',
                    action: deleteSelectedUsersFromGroup,
                    isDisabled: checkedRows.length < 1,
                    activeIcon: (
                      <FaTrash
                        className="mr-2 h-5 w-5 text-red-200"
                        aria-hidden="true"
                      />
                    ),
                    inactiveIcon: (
                      <FaTrashRestore
                        className="mr-2 h-5 w-5 text-red-200"
                        aria-hidden="true"
                      />
                    ),
                  },
                  {
                    name: `Remove group${
                      selectedGroup ? ' - ' + selectedGroup.name : ''
                    }`,
                    action: deleteGroup,
                    isDisabled: groups.length < 1,
                    activeIcon: (
                      <FaTrash
                        className="mr-2 h-5 w-5 text-red-200"
                        aria-hidden="true"
                      />
                    ),
                    inactiveIcon: (
                      <FaTrashRestore
                        className="mr-2 h-5 w-5 text-red-200"
                        aria-hidden="true"
                      />
                    ),
                  },
                  {
                    name: selectedGroup?.showOnlySubscribedCourses
                      ? 'Show all courses'
                      : 'Show only subscribed courses',
                    action: () => toggleGroupState('showOnlySubscribedCourses'),
                    isDisabled: groups.length < 1,
                    activeIcon: selectedGroup?.showOnlySubscribedCourses ? (
                      <FaEye className="mr-2 h-5 w-5" aria-hidden="true" />
                    ) : (
                      <FaEyeSlash className="mr-2 h-5 w-5" aria-hidden="true" />
                    ),
                    inactiveIcon: selectedGroup?.showOnlySubscribedCourses ? (
                      <FaEye className="mr-2 h-5 w-5" aria-hidden="true" />
                    ) : (
                      <FaEyeSlash className="mr-2 h-5 w-5" aria-hidden="true" />
                    ),
                  },
                  {
                    name: selectedGroup?.disableUpgrade
                      ? 'Enable plan upgrade'
                      : 'Disable plan upgrade',
                    action: () => toggleGroupState('disableUpgrade'),
                    isDisabled: groups.length < 1,
                    activeIcon: selectedGroup?.disableUpgrade ? (
                      <FaArrowUp className="mr-2 h-5 w-5" aria-hidden="true" />
                    ) : (
                      <FaArrowDown
                        className="mr-2 h-5 w-5"
                        aria-hidden="true"
                      />
                    ),
                    inactiveIcon: selectedGroup?.disableUpgrade ? (
                      <FaArrowUp className="mr-2 h-5 w-5" aria-hidden="true" />
                    ) : (
                      <FaArrowDown
                        className="mr-2 h-5 w-5"
                        aria-hidden="true"
                      />
                    ),
                  },
                  {
                    name: 'Activate account',
                    action: activateAccount,
                    isDisabled: checkedRows.length < 1 || groupUsers.length < 1,
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
                    action: deactivateAccount,
                    isDisabled: checkedRows.length < 1 || groupUsers.length < 1,
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
                ]}
              />
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex w-1/4 px-2 py-2">
              <div className="flex-1 rounded bg-white p-6 shadow-lg">
                <button
                  onClick={addGroupModalProps.toggle}
                  className="outline-none focus:outline-none mb-3 w-full cursor-pointer rounded bg-brand-primary py-2 px-4 font-bold text-white focus:ring"
                >
                  Add group
                </button>

                {groups.length ? (
                  <GroupItems
                    items={groups}
                    parent={null}
                    onGroupClick={onGroupClick}
                  />
                ) : (
                  <span className="text-lg font-bold">Groups not found</span>
                )}
              </div>
            </div>
            <div className="flex w-3/4 px-2 py-2">
              <div className="flex-1 rounded bg-white p-4 shadow-lg">
                <div className="h-full" style={{ minHeight: '500px' }}>
                  <VirtualizedTable
                    list={groupUsers}
                    checkedRows={checkedRows}
                    onCheckboxChangeAction={setCheckedRows}
                    CustomTable={GroupUserTable}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </AccessControl>
  );
};

export default GroupListPage;
