import Head from 'next/head';
import { useEffect, useState } from 'react';
import { AccessControl } from '../app-state/accessControl';
import API_PATHS from '../constants/apiPaths';
import { BACKEND_ADMIN_CONTROL } from '../constants/policies';
import { paymentHttp } from '../http';
import useTranslation from '../i18n/useTranslation';
import { AdminLayout } from '../layouts/admin.layout';
import LinkedPlanList from './LinkedPlanList';

const LinkedPlansPage = () => {
  const { t } = useTranslation();
  const [plans, setPlans] = useState([]);

  const getPlans = () => {
    return paymentHttp
      .get(`${API_PATHS.PLANS}?linked=true`)
      .then((response) => {
        setPlans(response.data.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    getPlans();
  }, []);

  async function onUnlinkAction(planId: string, organizationId: string) {
    try {
      await paymentHttp.put(
        API_PATHS.UNLINK_PLAN_TO_EXTERNAL_PROVIDER.replace(
          ':planId',
          planId,
        ).replace(':organizationId', organizationId),
      );

      const newPlans = plans.filter((p) => p.id !== planId);
      setPlans(newPlans);
    } catch (error) {
      console.error(
        'Error unlinking plan',
        error?.response?.data?.message || error,
      );
    }
  }

  return (
    <AccessControl
      policyNames={[
        BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
        BACKEND_ADMIN_CONTROL.ACCESS_LINKED_PLANS,
      ]}
    >
      <AdminLayout>
        <Head>
          <title>{t('headerText')} | Linked plans</title>
        </Head>
        <div className="mx-auto text-right">
          <div className="align-items-start flex justify-between">
            <h2 className="mb-2 py-2 text-left font-bold text-black">
              All linked plans
            </h2>
          </div>
          <LinkedPlanList
            organizationPlans={plans}
            onUnlinkAction={onUnlinkAction}
          />
        </div>
      </AdminLayout>
    </AccessControl>
  );
};

export default LinkedPlansPage;
