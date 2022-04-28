import cx, { Argument } from 'classnames';
import { format } from 'date-fns';
import Link from 'next/link';
import { Fragment } from 'react';
import WEB_PATHS from '../constants/webPaths';
import useTranslation from '../i18n/useTranslation';
import { UserOrder } from '../models/userOrder';

export interface IOrderListProps {
  isLoading: boolean;
  orders: UserOrder[];
}

export const OrderList = ({ isLoading, orders }: IOrderListProps) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="hidden grid-cols-5 items-stretch rounded-3xl border border-gray-200 bg-gray-100 px-6 lg:grid">
        <div className="border-b border-gray-300 py-4 text-caption font-semibold text-gray-500">
          {t('purchaseHistoryPage.date')}
        </div>
        <div className="col-span-3 border-b border-gray-300 py-4 text-caption font-semibold text-gray-500">
          {t('purchaseHistoryPage.orderDetails')}
        </div>
        <div className="border-b border-gray-300 py-4 text-right text-caption font-semibold text-gray-500">
          {t('purchaseHistoryPage.priceThb')}
        </div>
        {orders.length === 0 && !isLoading && (
          <div className="col-span-5 py-8 text-center text-gray-500">
            {t('purchaseHistoryPage.noPurchases')}
          </div>
        )}
        {orders.map((order, index) => {
          const isLast = orders.length - 1 === index;
          const borderBottom: Argument = {
            'border-gray-200 border-b': !isLast,
          };

          return (
            <Fragment key={order.id}>
              <div className={cx('py-4 text-gray-500', borderBottom)}>
                {format(new Date(order.createdAt), 'dd-MM-yyyy')}
              </div>
              <div className={cx('col-span-3 py-4', borderBottom)}>
                <Link href={WEB_PATHS.ORDER_STATUS.replace(':id', order.id)}>
                  <a className="font-semibold hover:underline">{order.name}</a>
                </Link>
                {order.externalOrderId && (
                  <div className="text-caption font-semibold text-brand-primary">
                    {order.externalOrderId}
                  </div>
                )}
              </div>
              <div
                className={cx('py-4 text-right font-semibold', borderBottom)}
              >
                {order.price}
              </div>
            </Fragment>
          );
        })}
      </div>
      <div className="block space-y-4 lg:hidden">
        {orders.map((order) => (
          <div
            key={order.id}
            className="rounded-2xl border border-gray-200 bg-gray-100 p-6"
          >
            <div className="text-gray-500">
              {format(new Date(order.createdAt), 'dd-MM-yyyy')}
            </div>

            <Link href={WEB_PATHS.ORDER_STATUS.replace(':id', order.id)}>
              <a className="mt-2 block font-semibold hover:underline">
                {order.name}
              </a>
            </Link>
            {order.externalOrderId && (
              <div className="mt-2 text-caption font-semibold text-brand-primary">
                {order.externalOrderId}
              </div>
            )}
            <div className="mt-6 text-right font-semibold">
              {order.price} THB
            </div>
          </div>
        ))}

        {orders.length === 0 && !isLoading && (
          <div className="rounded-2xl border border-gray-200 bg-gray-100 p-8 text-center text-gray-500">
            {t('purchaseHistoryPage.noPurchases')}
          </div>
        )}
      </div>
    </>
  );
};
