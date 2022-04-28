import Error from 'next/error';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import API_PATHS from '../constants/apiPaths';
import { paymentHttp } from '../http';
import useTranslation from '../i18n/useTranslation';
import { AdminLayout } from '../layouts/admin.layout';
import { SubscriptionPlan } from '../models/subscriptionPlan';
import ErrorMessages from '../ui-kit/ErrorMessage';
import { getErrorMessages } from '../utils/error';
import PlanForm from './PlanForm';

const PlanDetailPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = router.query;

  const scrollRef = useRef(null);
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingPlan, setIsUpdatingPlan] = useState(false);
  const [plan, setPlan] = useState<SubscriptionPlan>(null);

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      paymentHttp
        .get(API_PATHS.PLAN_DETAIL_ALL.replace(':planId', id as string))
        .then((response) => {
          setPlan(response.data.data);
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [id]);

  async function onSaveAction(data) {
    try {
      setIsUpdatingPlan(true);
      await paymentHttp.put(
        API_PATHS.PLAN_DETAIL.replace(':planId', id as string),
        data,
      );
    } catch (err) {
      handleError(err);
      executeScroll();
    } finally {
      setIsUpdatingPlan(false);
    }
  }

  const handleError = (error) => {
    const errors = getErrorMessages(error);
    setErrors(errors);
  };

  const executeScroll = () => scrollRef.current.scrollIntoView();

  if (isLoading) return null;
  if (!plan || !plan.id) return <Error statusCode={404} />;

  return (
    <AdminLayout>
      <Head>
        <title>{t('headerText')} | Plan Detail</title>
      </Head>
      <div
        ref={scrollRef}
        className="mx-auto mt-4 flex w-full max-w-md flex-col justify-start text-center"
      >
        <div className="mb-8">
          <h2 className="mb-2 py-2 text-2xl font-bold text-black">
            Plan detail and settings
          </h2>
        </div>

        <ErrorMessages messages={errors} onClearAction={() => setErrors([])} />

        <div>
          <PlanForm
            onSaveAction={onSaveAction}
            plan={plan}
            updatingPlan={updatingPlan}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default PlanDetailPage;
