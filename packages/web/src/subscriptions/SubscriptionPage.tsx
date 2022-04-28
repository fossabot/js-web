import { useEffect, useState } from 'react';
import Head from 'next/head';
import Cookies from 'js-cookie';
import format from 'date-fns/format';
import { useRouter } from 'next/router';

import { authHttp, paymentHttp } from '../http';
import Layout from '../layouts/main.layout';
import WEB_PATHS from '../constants/webPaths';
import API_PATHS from '../constants/apiPaths';
import useTranslation from '../i18n/useTranslation';
import { COOKIE_KEYS } from '../constants/cookies';

const SubscriptionPage = ({ token }) => {
  const router = useRouter();
  const { t } = useTranslation();
  const [subscriptions, setSubscriptions] = useState([]);

  function getSubscriptions() {
    return paymentHttp
      .get(API_PATHS.MY_SUBSCRIPTIONS)
      .then((response) => {
        setSubscriptions(response.data.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  useEffect(() => {
    const planId = Cookies.get(COOKIE_KEYS.PACKAGE_PRE_PURCHASE);

    if (planId) {
      router.push(WEB_PATHS.PLAN_DETAIL.replace(':planId', planId));
      return;
    }

    getSubscriptions();
  }, []);

  async function goToSite(subscription: any) {
    try {
      const response = await authHttp.get(
        API_PATHS.THIRD_PARTY_SSO_PROVIDER_URL.replace(
          ':planId',
          subscription.subscriptionPlan.id,
        ),
      );

      const url = response.data;

      if (!url) {
        // eslint-disable-next-line no-console
        console.error('Cannot get url for login');
        return;
      }

      window.location.href = url;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error?.response?.data?.message || error);
    }
  }

  return (
    <Layout token={token}>
      <Head>
        <title>{t('headerText')} | My Subscriptions</title>
      </Head>
      <div className="mx-auto mt-4 flex max-w-md flex-col justify-start text-center">
        <div className="mb-8">
          <h4 className="mb-4 text-4xl">Subscription Page</h4>
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-full flex-shrink-0 flex-row flex-wrap justify-center">
        {subscriptions.map((s) => {
          return (
            <div className="p-2" key={s.id}>
              <div className="flex w-full max-w-full">
                <div
                  className="w-48 flex-none overflow-hidden rounded-t bg-gray-300 bg-cover text-center lg:rounded-t-none lg:rounded-l"
                  title="Subscription cover"
                ></div>
                <div className="flex max-w-sm flex-col justify-between rounded-b border-r border-b border-l border-gray-300 bg-white p-4 leading-normal lg:rounded-b-none lg:rounded-r lg:border-l-0 lg:border-t lg:border-gray-300">
                  <div className="mb-2">
                    <div className="mb-2 text-xl font-bold text-gray-900">
                      {s.subscriptionPlan.name}
                    </div>
                    <p className="text-base text-gray-700">
                      Start Date:{' '}
                      {format(new Date(s.startDate), 'dd MMMM yyyy')}
                    </p>
                    <p className="mb-4 text-base text-gray-700">
                      End Date: {format(new Date(s.endDate), 'dd MMMM yyyy')}
                    </p>
                    <div className="flex flex-row">
                      <button
                        className="outline-none focus:outline-none mb-3 mr-1 w-full cursor-pointer rounded bg-brand-primary py-2 px-4 font-bold text-white focus:ring"
                        onClick={() =>
                          router.push(
                            WEB_PATHS.PLAN_DETAIL.replace(
                              ':planId',
                              s.subscriptionPlan.id,
                            ),
                          )
                        }
                      >
                        Renew
                      </button>
                      <button
                        onClick={() => goToSite(s)}
                        className="outline-none focus:outline-none mb-3 ml-1 w-full cursor-pointer rounded bg-brand-primary py-2 px-4 font-bold text-white focus:ring"
                      >
                        Go to site
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Layout>
  );
};

export default SubscriptionPage;
