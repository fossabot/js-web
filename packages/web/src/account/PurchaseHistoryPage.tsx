import Head from 'next/head';
import useTranslation from '../i18n/useTranslation';
import Layout from '../layouts/main.layout';
import { OrderList } from '../order/OrderList';
import { useUserOrders } from '../order/useUserOrders';
import InfiniteScrollArea from '../ui-kit/InfiniteScrollArea';
import UserSidebar from '../ui-kit/sidebars/UserSidebar';

export const PurchaseHistoryPage = ({ token }) => {
  const { t } = useTranslation();

  const { orders, fetchMoreOrders, isFetching } = useUserOrders();

  return (
    <Layout token={token} sidebar={<UserSidebar />} includeSidebar={true}>
      <Head>
        <title>
          {t('headerText')} | {t('purchaseHistoryPage.title')}
        </title>
      </Head>
      <div className="flex flex-1 flex-col space-y-6 lg:mx-auto lg:w-100">
        <h1 className="text-subheading font-semibold">
          {t('purchaseHistoryPage.title')}
        </h1>

        <InfiniteScrollArea
          onScrollToBottom={fetchMoreOrders}
          loading={isFetching}
        >
          <OrderList orders={orders} isLoading={isFetching} />
        </InfiniteScrollArea>
      </div>
    </Layout>
  );
};
