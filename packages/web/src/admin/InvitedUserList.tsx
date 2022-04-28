import { FC } from 'react';
import { TableColumn, TableHead } from '../ui-kit/Table';
import Pagination from '../ui-kit/Pagination';
import InputCheckbox from '../ui-kit/InputCheckbox';

interface IInviteUserList {
  users: any[];
  totalPages: number;
  resendInvitationIds: string[];
  onResendAction: (number) => void;
  isSelectAll: boolean;
  setSelectAll: (boolean) => void;
  onClickSelect: (string) => void;
}

const InvitedUserList: FC<IInviteUserList> = (props) => {
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
              <TableHead className="w-1/8">First Name</TableHead>
              <TableHead className="w-1/8">Last Name</TableHead>
              <TableHead className="w-1/8">Email</TableHead>
              <TableHead className="w-1/8">Organization</TableHead>
              <TableHead className="w-1/8">Role</TableHead>
              <TableHead className="w-1/8">Created By</TableHead>
            </tr>
          </thead>
          <tbody>
            {props.users && props.users.length > 0 ? (
              props.users.map((user, index) => {
                return (
                  <tr
                    className="hover:bg-gray-100"
                    key={index}
                    onClick={() => props.onClickSelect(user.id)}
                  >
                    <TableColumn>
                      <InputCheckbox
                        inputClassName="cursor-pointer"
                        name={`checkbox-${user.id}`}
                        checked={props.resendInvitationIds.includes(user.id)}
                        readOnly={true}
                      />
                    </TableColumn>
                    <TableColumn>{user.firstName}</TableColumn>
                    <TableColumn>{user.lastName}</TableColumn>
                    <TableColumn>{user.email}</TableColumn>
                    <TableColumn>{user.organization?.name || ''}</TableColumn>
                    <TableColumn>{user.role.name}</TableColumn>
                    <TableColumn>{user.invitedBy.firstName}</TableColumn>
                  </tr>
                );
              })
            ) : (
              <tr className="text-center hover:bg-gray-100">
                <TableColumn colSpan={7}>No records found!</TableColumn>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {props.totalPages > 0 && <Pagination totalPages={props.totalPages} />}
    </>
  );
};

export default InvitedUserList;
