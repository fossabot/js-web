import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AccessControl } from '../app-state/accessControl';
import { BACKEND_ADMIN_CONTROL } from '../constants/policies';
import WEB_PATHS from '../constants/webPaths';
import useTranslation from '../i18n/useTranslation';
import { AdminLayout } from '../layouts/admin.layout';
import { OrderList } from '../order/OrderList';
import { useUserOrders } from '../order/useUserOrders';
import { ArrowLeft } from '../ui-kit/icons';
import InfiniteScrollArea from '../ui-kit/InfiniteScrollArea';

export const UserPurchaseHistoryList = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const userId = router.query.id as string;

  const { orders, fetchMoreOrders, isFetching } = useUserOrders(userId);

  if (!userId) return null;

  return (
    <div className="flex flex-1 flex-col space-y-6 lg:mx-auto lg:w-244">
      <Link href={WEB_PATHS.ADMIN_USER_MANAGEMENT}>
        <a className="flex items-center space-x-2 text-brand-primary">
          <ArrowLeft />
          <span>{t('userPurchaseHistoryPage.backToUserMngt')}</span>
        </a>
      </Link>

      <h1 className="text-subheading font-semibold">
        {t('userPurchaseHistoryPage.title')}
      </h1>

      <InfiniteScrollArea
        onScrollToBottom={fetchMoreOrders}
        loading={isFetching}
      >
        <OrderList orders={orders} isLoading={isFetching} />
      </InfiniteScrollArea>
    </div>
  );
};

export const UserPurchaseHistoryPage = () => {
  const { t } = useTranslation();

  return (
    <AccessControl
      policyNames={[
        BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
        BACKEND_ADMIN_CONTROL.ACCESS_USER_MANAGEMENT,
      ]}
    >
      <AdminLayout>
        <Head>
          <title>
            {t('headerText')} | {t('userPurchaseHistoryPage.title')}
          </title>
        </Head>
        <UserPurchaseHistoryList />
      </AdminLayout>
    </AccessControl>
  );
};
