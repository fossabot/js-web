import cx from 'classnames';
import { isAfter } from 'date-fns';
import { useRouter } from 'next/router';
import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { TiTick } from 'react-icons/ti';
import { VscError } from 'react-icons/vsc';
import WEB_PATHS from '../constants/webPaths';
import RoleApi from '../http/role.api';
import { IUser } from '../models/auth';
import { Role } from '../models/role';
import Button from '../ui-kit/Button';
import ConfirmationModal from '../ui-kit/ConfirmationModal';
import InputCheckbox from '../ui-kit/InputCheckbox';
import InputSelect from '../ui-kit/InputSelect';
import { useModal } from '../ui-kit/Modal';
import Pagination from '../ui-kit/Pagination';
import { TableColumn, TableHead } from '../ui-kit/Table';

interface IProps {
  currentUserId: string;
  users: IUser[];
  totalPages?: number;
  onClickSelect: (string) => void;
  isSelectAll: boolean;
  setSelectAll: (boolean) => void;
  selectedUsers: string[];
  handleRowUpdated: () => void;
}

interface IUserListItemProps {
  currentUserId: string;
  user: IUser;
  checked: boolean;
  roles: Role[];
  handleClickRole: (user: IUser, roleId: string) => void;
  onClickSelect: (string) => void;
}

const UserListItem: FunctionComponent<IUserListItemProps> = ({
  user,
  checked,
  currentUserId,
  handleClickRole,
  onClickSelect,
}) => {
  const router = useRouter();

  const renderBoolean = (booleanVal = false) => {
    if (booleanVal) {
      return <TiTick />;
    }
    return <VscError />;
  };

  const isUserLockedOut = (user: any) => {
    const date = Date.now();

    return (
      user &&
      user.isLockedOut &&
      user.lockoutEndDateUTC &&
      isAfter(new Date(user.lockoutEndDateUTC), date)
    );
  };

  return (
    <tr className="hover:bg-gray-100" onClick={() => onClickSelect(user.id)}>
      <TableColumn>
        <InputCheckbox
          inputClassName="cursor-pointer"
          name={`checkbox-${user.id}`}
          checked={checked}
          readOnly={true}
        />
      </TableColumn>
      <TableColumn>{user.firstName}</TableColumn>
      <TableColumn>{user.lastName}</TableColumn>
      <TableColumn>{user.email}</TableColumn>
      <TableColumn>
        <span
          onClick={(e) => {
            e.stopPropagation();
            if (currentUserId !== user.id) {
              handleClickRole(user, user.defaultRole?.id);
            }
          }}
          className={cx(
            currentUserId !== user.id && 'cursor-pointer underline',
          )}
        >
          {user.defaultRole?.name}
        </span>
      </TableColumn>
      <TableColumn>{renderBoolean(user.isEmailConfirmed)}</TableColumn>
      <TableColumn>{renderBoolean(user.isTwoFactorEnabled)}</TableColumn>
      <TableColumn>{renderBoolean(isUserLockedOut(user))}</TableColumn>
      <TableColumn>{renderBoolean(user.isActivated)}</TableColumn>
      <TableColumn>
        <Button
          size="small"
          type="button"
          variant="primary"
          onClick={() =>
            router.push(
              WEB_PATHS.ADMIN_USER_PURCHASE_HISTORY.replace(':id', user.id),
            )
          }
        >
          View
        </Button>
      </TableColumn>
      <TableColumn>
        <Button
          size="small"
          type="button"
          variant="primary"
          onClick={() =>
            router.push(WEB_PATHS.ADMIN_USER_PROFILE.replace(':id', user.id))
          }
        >
          View
        </Button>
      </TableColumn>
    </tr>
  );
};

const UserList: FunctionComponent<IProps> = (props) => {
  const [roles, setRoles] = useState([]);
  const [workingUser, setWorkingUser] = useState(null);
  const [workingRoleId, setWorkingRoleId] = useState(null);
  const changeRoleModalProps = useModal();

  const getRoles = async () => {
    const data = await RoleApi.getRoles();
    setRoles(data);
  };

  const renderRoles = useMemo(() => {
    return roles.map((opt) => ({ label: opt.name, value: opt.id }));
  }, [roles]);

  const onConfirmChangeRole = async () => {
    await RoleApi.updateUserRole(workingUser.id, workingRoleId);
    setWorkingUser(null);
    setWorkingRoleId(null);
    props.handleRowUpdated();
  };

  const onCancelChangeRole = () => {
    setWorkingUser(null);
    setWorkingRoleId(null);
  };

  const handleClickRole = (user: IUser, roleId: string) => {
    setWorkingUser(user);
    setWorkingRoleId(roleId);
    changeRoleModalProps.toggle();
  };

  useEffect(() => {
    getRoles();
  }, []);

  return (
    <>
      <div className="my-4 overflow-x-scroll rounded bg-white shadow-md">
        <table className="w-full table-auto border-collapse border text-left">
          <thead>
            <tr>
              <TableHead className="w-min">
                <InputCheckbox
                  name="checkbox-header"
                  checked={props.isSelectAll}
                  onChange={() => {
                    props.setSelectAll(!props.isSelectAll);
                  }}
                />
              </TableHead>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Is Email Confirmed?</TableHead>
              <TableHead>IS 2FA Enabled?</TableHead>
              <TableHead>Is User Locked Out?</TableHead>
              <TableHead>Is Activated?</TableHead>
              <TableHead>Purchase History</TableHead>
              <TableHead>Profile</TableHead>
            </tr>
          </thead>
          <tbody>
            {props.users && props.users.length > 0 ? (
              props.users.map((user) => (
                <UserListItem
                  key={user.id}
                  user={user}
                  currentUserId={props.currentUserId}
                  onClickSelect={props.onClickSelect}
                  checked={props.selectedUsers.includes(user.id)}
                  roles={roles}
                  handleClickRole={handleClickRole}
                />
              ))
            ) : (
              <tr className="text-center hover:bg-gray-100">
                <TableColumn colSpan={10}>No records found!</TableColumn>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {props.totalPages > 0 && <Pagination totalPages={props.totalPages} />}

      <ConfirmationModal
        header="Change Role"
        body={
          <>
            {workingUser ? (
              <div className="h-52">
                <p className="mb-3">
                  Which role do you want to change for
                  <strong className="ml-2">
                    {(
                      workingUser.firstName +
                      ' ' +
                      workingUser.lastName
                    ).trim()}
                  </strong>
                  ?
                </p>
                <InputSelect
                  name="role"
                  options={roles}
                  value={{
                    label:
                      roles.find((r) => r.id === workingRoleId)?.name ||
                      'Select...',
                    value: workingUser.defaultRoleId,
                  }}
                  renderOptions={renderRoles}
                  selectClassWrapperName="mb-3"
                  onChange={(e) => setWorkingRoleId(e.target.value)}
                  isSearchable
                  onBlur={null}
                  maxMenuHeight={130}
                />
              </div>
            ) : null}
          </>
        }
        confirmBtnInner="Confirm"
        cancelBtnInner="Cancel"
        onOk={onConfirmChangeRole}
        onCancel={onCancelChangeRole}
        isOpen={changeRoleModalProps.isOpen}
        toggle={changeRoleModalProps.toggle}
      />
    </>
  );
};

export default UserList;
