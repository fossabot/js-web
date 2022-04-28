import { useRouter } from 'next/router';
import { FC } from 'react';
import { TiTick } from 'react-icons/ti';
import { VscError } from 'react-icons/vsc';

import Button from '../ui-kit/Button';
import Pagination from '../ui-kit/Pagination';
import { TableColumn, TableHead } from '../ui-kit/Table';
import { SubscriptionPlan } from '../models/subscriptionPlan';

interface IPlanList {
  plans: SubscriptionPlan[];
  totalPages: number;
}

const PlanList: FC<IPlanList> = (props) => {
  const renderBoolean = (booleanVal = false) => {
    if (booleanVal) {
      return <TiTick />;
    }

    return <VscError />;
  };

  const router = useRouter();

  const handlePlanClick = (id: string) => {
    router.push(`/admin/plan-management/${id}`);
  };

  return (
    <>
      <div className="my-4 overflow-x-scroll rounded bg-white shadow-md">
        <table className="w-full table-auto border-collapse border text-left">
          <thead>
            <tr>
              <TableHead className="w-1/12">Product ID</TableHead>
              <TableHead className="w-1/6">Product Name</TableHead>
              <TableHead className="w-1/12">Product Price</TableHead>
              <TableHead className="w-1/12">Currency</TableHead>
              <TableHead className="w-1/12">Package</TableHead>
              <TableHead className="w-1/12">Duration</TableHead>
              <TableHead className="w-1/12">Active</TableHead>
              <TableHead className="w-1/12">Public</TableHead>
              <TableHead className="w-1/12">Default</TableHead>
              <TableHead className="w-1/12">Action</TableHead>
            </tr>
          </thead>
          <tbody className="w-full">
            {props.plans && props.plans.length > 0 ? (
              props.plans.map((plan, index) => {
                return (
                  <tr className="hover:bg-gray-100" key={index}>
                    <TableColumn>{plan.productId}</TableColumn>
                    <TableColumn>{plan.name}</TableColumn>
                    <TableColumn>{plan.price}</TableColumn>
                    <TableColumn>{plan.currency}</TableColumn>
                    <TableColumn>{plan.packageType}</TableColumn>
                    <TableColumn>{`${plan.durationValue} ${
                      plan.durationInterval
                    }${plan.durationValue > 1 ? 's' : ''}`}</TableColumn>
                    <TableColumn>{renderBoolean(plan.isActive)}</TableColumn>
                    <TableColumn>{renderBoolean(plan.isPublic)}</TableColumn>
                    <TableColumn>
                      {renderBoolean(plan.isDefaultPackage)}
                    </TableColumn>
                    <TableColumn>
                      <Button
                        type="button"
                        variant="primary"
                        size="medium"
                        onClick={() => handlePlanClick(plan.id)}
                      >
                        View details
                      </Button>
                    </TableColumn>
                  </tr>
                );
              })
            ) : (
              <tr className="text-center hover:bg-gray-100">
                <TableColumn colSpan={9}>No records found!</TableColumn>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {props.totalPages > 0 && <Pagination totalPages={props.totalPages} />}
    </>
  );
};

export default PlanList;
