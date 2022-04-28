import Head from 'next/head';
import { useRouter } from 'next/router';
import { AccessControl } from '../app-state/accessControl';
import API_PATHS from '../constants/apiPaths';
import { BACKEND_ADMIN_CONTROL } from '../constants/policies';
import WEB_PATHS from '../constants/webPaths';
import useList, { FetchOptions } from '../hooks/useList';
import { paymentHttp } from '../http';
import useTranslation from '../i18n/useTranslation';
import { AdminLayout } from '../layouts/admin.layout';
import DropdownButton from '../ui-kit/DropdownButton';
import { FileDuplicate } from '../ui-kit/icons';
import ListSearch from '../ui-kit/ListSearch';
import PlanList from './PlanList';

const sortOptions = [
  { label: 'Created Date', value: 'createdAt' },
  { label: 'Plan name', value: 'name' },
  { label: 'Plan duration', value: 'durationValue' },
];

const PlanListPage = () => {
  const router = useRouter();

  const { t } = useTranslation();
  const { data, totalPages } = useList<any>((options) => {
    return getPlansPromise(options);
  });

  const getPlansPromise = (options: FetchOptions) => {
    return paymentHttp.get(API_PATHS.ALL_PLANS, { params: options });
  };

  const managePlanCourseOutlineBundleIcon = (
    <FileDuplicate className="mr-2 h-5 w-5 text-green-200" aria-hidden="true" />
  );

  return (
    <AccessControl
      policyNames={[
        BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
        BACKEND_ADMIN_CONTROL.ACCESS_PLAN_MANAGEMENT,
      ]}
    >
      <AdminLayout>
        <Head>
          <title>{t('headerText')} | Plan management</title>
        </Head>
        <div className="mx-6 text-right lg:mx-8">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex w-1/4">
              <h2 className="mb-2 py-2 text-left font-bold text-black">
                All plans
              </h2>
            </div>
            <DropdownButton
              wrapperClassNames={'mx-1 mt-4 lg:mt-0'}
              buttonName={'Actions'}
              menuItems={[
                {
                  name: 'Manage course bundles',
                  action: () => router.push(WEB_PATHS.PLAN_COURSE_BUNDLE),
                  activeIcon: managePlanCourseOutlineBundleIcon,
                  inactiveIcon: managePlanCourseOutlineBundleIcon,
                },
              ]}
            />
          </div>
          <div className="mt-4">
            <ListSearch
              defaultSearchField="name"
              fieldOptions={[
                { label: 'Product name', value: 'name' },
                { label: 'Product ID', value: 'productId' },
              ]}
              sortOptions={sortOptions}
            />
          </div>
          <PlanList plans={data} totalPages={totalPages} />
        </div>
      </AdminLayout>
    </AccessControl>
  );
};

export default PlanListPage;
