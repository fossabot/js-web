import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { paymentHttp } from '../http';
import Layout from '../layouts/main.layout';
import API_PATHS from '../constants/apiPaths';
import useTranslation from '../i18n/useTranslation';
import OrganizationPlanList from './OrganizationPlanList';
import LinkPlanToOrganization from './LinkPlanToOrganization';

const ExternalProviderPlanPage = ({ token }) => {
  const router = useRouter();
  const { t } = useTranslation();
  const [plans, setPlans] = useState([]);
  const [organizationPlans, setOrganizationPlans] = useState([]);

  const getOrganizationPlans = () => {
    return paymentHttp
      .get(`${API_PATHS.PLANS}?organizationId=${router.query.id}`)
      .then((response) => {
        setOrganizationPlans(response.data.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const getPlans = () => {
    return paymentHttp
      .get(`${API_PATHS.PLANS}?unlinked=true`)
      .then((response) => {
        setPlans(response.data.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    getOrganizationPlans();
    getPlans();
  }, []);

  async function onAddAction(planId: string) {
    try {
      const response = await paymentHttp.put(
        API_PATHS.LINK_PLAN_TO_EXTERNAL_PROVIDER.replace(
          ':planId',
          planId,
        ).replace(':organizationId', router.query.id as string),
      );

      const newPlans = plans.filter((p) => p.id !== planId);
      const newOrganizationPlans = organizationPlans.concat([
        response.data.data,
      ]);

      setPlans(newPlans);
      setOrganizationPlans(newOrganizationPlans);
    } catch (error) {
      console.error('Link plan error', error?.response?.data?.message || error);
    }
  }

  async function onUnlinkAction(planId: string) {
    try {
      const response = await paymentHttp.put(
        API_PATHS.UNLINK_PLAN_TO_EXTERNAL_PROVIDER.replace(
          ':planId',
          planId,
        ).replace(':organizationId', router.query.id as string),
      );

      const newPlans = plans.concat([response.data.data]);
      const newOrganizationPlans = organizationPlans.filter(
        (p) => p.id !== planId,
      );

      setPlans(newPlans);
      setOrganizationPlans(newOrganizationPlans);
    } catch (error) {
      console.error(
        'Error unlinking plan',
        error?.response?.data?.message || error,
      );
    }
  }

  return (
    <Layout token={token}>
      <Head>
        <title>{t('headerText')} | External provider plans</title>
      </Head>
      <div className="mx-auto text-right">
        <div className="align-items-start flex justify-between">
          <h2 className="mb-2 py-2 text-left font-bold text-black">
            All linked plans
          </h2>
        </div>
        <LinkPlanToOrganization plans={plans} onAddAction={onAddAction} />
        <OrganizationPlanList
          organizationPlans={organizationPlans}
          onUnlinkAction={onUnlinkAction}
        />
      </div>
    </Layout>
  );
};

export default ExternalProviderPlanPage;
