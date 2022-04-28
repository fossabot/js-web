import Head from 'next/head';
import { useAuthInfo } from '../app-state/useAuthInfo';
import { paymentHttp } from '../http';
import API_PATHS from '../constants/apiPaths';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../layouts/main.layout';
import MinimalNavbar from '../ui-kit/headers/MinimalNavbar';
import PaymentSuccessPage from './PaymentSuccessPage';
import PaymentPendingPage from './PaymentPendingPage';
import PaymentFailurePage from './PaymentFailurePage';
import PaymentNotFoundPage from './PaymentNotFoundPage';
import useTranslation from '../i18n/useTranslation';

export default function PaymentStatusPage() {
  const { context } = useAuthInfo();
  const [order, setOrder] = useState(null);
  const router = useRouter();
  const { id: orderId } = router.query;
  const { t } = useTranslation();

  const getOrder = (orderId) => {
    return paymentHttp
      .get(`${API_PATHS.ORDER_PAYMENT_STATUS}`.replace(':id', orderId))
      .then((response) => {
        setOrder(response.data.data);
      })
      .catch((error) => {
        console.error(error);
        if ([404, 500].includes(error?.response?.data?.statusCode)) {
          setOrder({ status: 'NOT_FOUND' });
        }
      });
  };

  useEffect(() => {
    getOrder(orderId);
  }, []);

  if (!order) return null;

  let page = null;
  let pageName = '';
  if (order.status === 'COMPLETED') {
    pageName = 'paymentSuccessPage';
    page = <PaymentSuccessPage order={order} />;
  } else if (order.status === 'PENDING') {
    pageName = 'paymentPendingPage';
    page = <PaymentPendingPage />;
  } else if (order.status === 'NOT_FOUND') {
    pageName = 'paymentNotFoundPage';
    page = <PaymentNotFoundPage />;
  } else {
    pageName = 'paymentFailurePage';
    page = <PaymentFailurePage />;
  }

  const head = (
    <Head>
      <title>
        {t('headerText')} | {t(`${pageName}.metaTitle`)}
      </title>
      <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>
    </Head>
  );

  return (
    <Layout
      token={context}
      head={head}
      header={<MinimalNavbar />}
      boxedContent={true}
    >
      {page}
    </Layout>
  );
}
