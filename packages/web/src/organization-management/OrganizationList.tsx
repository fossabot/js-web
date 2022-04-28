import { FC } from 'react';
import { TiTick } from 'react-icons/ti';
import { VscError } from 'react-icons/vsc';
import { TableColumn, TableHead } from '../ui-kit/Table';
import Pagination from '../ui-kit/Pagination';
import InputCheckbox from '../ui-kit/InputCheckbox';

interface IOrganizationList {
  totalPages: number;
  organizations: any[];
  onViewAction: (number) => void;
  onDeleteAction: (number) => void;
  setSelectAll: (boolean) => void;
  isSelectAll: boolean;
  selectedOrgIds: string[];
  onClickSelect: (string) => void;
}

const OrganizationList: FC<IOrganizationList> = (props) => {
  const renderBoolean = (booleanVal = false) => {
    if (booleanVal) {
      return <TiTick />;
    }

    return <VscError />;
  };

  return (
    <>
      <div className="my-4 overflow-x-scroll rounded bg-white shadow-md">
        <table className="table-auto border-collapse border text-left">
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
              <TableHead className="w-1/4">Organization name</TableHead>
              <TableHead className="w-1/8">SSO setup status</TableHead>
              <TableHead className="w-1/4">Is 3rd party provider?</TableHead>
              <TableHead className="w-1/8">Active status</TableHead>
              <TableHead className="w-1/4" />
            </tr>
          </thead>
          <tbody className="w-full">
            {props.organizations && props.organizations.length > 0 ? (
              props.organizations.map((organization, index) => {
                return (
                  <tr
                    className="hover:bg-gray-100"
                    key={index}
                    onClick={() => props.onClickSelect(organization.id)}
                  >
                    <TableColumn>
                      <InputCheckbox
                        inputClassName="cursor-pointer"
                        name={`checkbox-${organization.id}`}
                        checked={props.selectedOrgIds.includes(organization.id)}
                        readOnly={true}
                      />
                    </TableColumn>
                    <TableColumn>{organization.name}</TableColumn>
                    <TableColumn>
                      {renderBoolean(organization.isSSOSetup)}
                    </TableColumn>
                    <TableColumn>
                      {renderBoolean(organization.isServiceProvider)}
                    </TableColumn>
                    <TableColumn>
                      {renderBoolean(organization.isActive)}
                    </TableColumn>
                    <TableColumn>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          props.onViewAction(organization.id);
                        }}
                        className="outline-none focus:outline-none cursor-pointer rounded bg-blue-500 py-2 px-2 text-xs font-bold text-white focus:ring disabled:opacity-50"
                      >
                        View details
                      </button>
                    </TableColumn>
                  </tr>
                );
              })
            ) : (
              <tr className="text-center hover:bg-gray-100">
                <TableColumn colSpan={4}>No records found!</TableColumn>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {props.totalPages > 0 && <Pagination totalPages={props.totalPages} />}
    </>
  );
};

export default OrganizationList;
