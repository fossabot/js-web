import Link from 'next/link';
import WEB_PATHS from '../constants/webPaths';
import { TableColumn, TableHead } from '../ui-kit/Table';

const LinkedPlanList = (props) => {
  return (
    <div className="my-4 overflow-x-scroll rounded bg-white shadow-md">
      <table className="table-auto border-collapse border text-left">
        <thead>
          <tr>
            <TableHead className="w-1/4">Plan ID</TableHead>
            <TableHead className="w-1/4">Plan name</TableHead>
            <TableHead className="w-1/4">Organization name</TableHead>
            <TableHead className="w-1/8">Plan Product ID</TableHead>
            <TableHead className="w-1/8">Actions</TableHead>
          </tr>
        </thead>
        <tbody>
          {props.organizationPlans && props.organizationPlans.length > 0 ? (
            props.organizationPlans.map((op, index) => {
              return (
                <tr className="hover:bg-gray-100" key={index}>
                  <TableColumn>{op.id}</TableColumn>
                  <TableColumn>{op.name}</TableColumn>
                  <TableColumn>
                    <Link
                      href={WEB_PATHS.ORGANIZATION_DETAIL.replace(
                        ':id',
                        op.externalProvider.id,
                      )}
                    >
                      <a className="text-blue-600 underline">
                        {op.externalProvider.name}
                      </a>
                    </Link>
                  </TableColumn>
                  <TableColumn>{op.productId}</TableColumn>
                  <TableColumn>
                    <button
                      onClick={() =>
                        props.onUnlinkAction(op.id, op.externalProvider.id)
                      }
                      className="outline-none focus:outline-none cursor-pointer rounded bg-blue-500 py-2 px-2 text-xs font-bold text-white focus:ring disabled:opacity-50"
                    >
                      Unlink plan
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
  );
};

export default LinkedPlanList;
