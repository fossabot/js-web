import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import numeral from 'numeral';
import pluralize from 'pluralize';
import React, { FunctionComponent, useEffect } from 'react';
import { useAuthInfo } from '../app-state/useAuthInfo';
import Layout from '../layouts/main.layout';
import { usePlan } from './usePlan';
import { startCase } from 'lodash';

const PlanScheduleAllAccessPage: FunctionComponent<any> = () => {
  const { plans, fetchPlans, error, loading } = usePlan();
  const { context } = useAuthInfo();
  const router = useRouter();
  const packageType = router.query.packageType as string;

  useEffect(() => {
    // TODO: Don't use custom logic here.
    fetchPlans(packageType === 'all-access' ? 'all_access' : packageType);
  }, []);

  if (loading) {
    return null;
  }

  if (error && error.response?.status === 400) {
    router.push('/404');
    return null;
  }

  const packageTitleMap = {
    'all-access': 'All Access',
    all_access: 'All Access',
    online: 'Online',
    virtual: 'Virtual',
  };
  const packageTitle = `YourNextU ${startCase(
    packageTitleMap[packageType] || packageType,
  )} Package`;

  return (
    <Layout token={context.token ? context : undefined}>
      <Head>
        <title>{packageTitle}</title>
      </Head>
      <div className="mx-auto box-border border border-gray-300 lg:w-1/3">
        <div className="bg-brand-tertiary p-3 text-center text-white">
          {packageTitle}
        </div>
        <div className="p-3">
          <ul className="mx-12 list-disc">
            <li>Online</li>
            <li>Classroom</li>
            <li>Social Learning</li>
            <li>Library</li>
          </ul>
        </div>
        <div className="px-10 py-5">
          {plans.map((pkg) => (
            <Link key={pkg.id} href={`/payment/plan/${pkg.id}`}>
              <button className=" outline-none focus:outline-none mt-2 w-full rounded border bg-brand-primary p-2 text-white">
                {`THB${numeral(pkg.price).format('0,0')} (exclude VAT)/${
                  pkg.durationValue
                } ${pluralize(
                  startCase(pkg.durationInterval),
                  pkg.durationValue,
                )}`}
              </button>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default PlanScheduleAllAccessPage;
