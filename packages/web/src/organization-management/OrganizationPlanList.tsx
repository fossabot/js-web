import { TableColumn, TableHead } from '../ui-kit/Table';

const OrganizationPlanList = (props) => {
  return (
    <div className="my-4 rounded bg-white shadow-md">
      <table className="table-auto border-collapse text-left">
        <thead>
          <tr>
            <TableHead className="w-1/3">Plan ID</TableHead>
            <TableHead className="w-1/3">Plan name</TableHead>
            <TableHead className="w-1/6">Plan Product ID</TableHead>
            <TableHead className="w-1/6">Actions</TableHead>
          </tr>
        </thead>
        <tbody>
          {props.organizationPlans && props.organizationPlans.length > 0 ? (
            props.organizationPlans.map((op, index) => {
              return (
                <tr className="hover:bg-gray-100" key={index}>
                  <TableColumn>{op.id}</TableColumn>
                  <TableColumn>{op.name}</TableColumn>
                  <TableColumn>{op.productId}</TableColumn>
                  <TableColumn>
                    <button
                      onClick={() => props.onUnlinkAction(op.id)}
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

export default OrganizationPlanList;
