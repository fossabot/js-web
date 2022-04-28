import useTranslation from '../i18n/useTranslation';
import { IOrder } from '../models/order';

export default function OrderSummary({ order }: { order: IOrder }) {
  const { t } = useTranslation();

  return (
    <>
      <div className="mb-6 text-subheading font-bold text-brand-primary">
        {t('paymentSuccessPage.orderSummary')}
      </div>
      <div className="flex w-full border-b border-gray-200 pb-6">
        <div className="flex-1 text-left text-body font-semibold text-gray-500">
          {t('paymentSuccessPage.item')}
        </div>
        <div className="w-1/3 text-right text-body font-semibold text-gray-500">
          {t('paymentSuccessPage.price')}
        </div>
      </div>

      <div className="border-b border-gray-200 py-4">
        <div className="flex w-full py-2">
          <div className="flex-1 text-left text-body">
            {order?.subscriptionPlan?.name}
          </div>
          <div className="w-2/6 text-right text-body lg:w-1/5">
            {order.metaData?.price}
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 py-4">
        <div className="flex w-full py-2">
          <div className="flex-1 text-left text-body">
            {t('paymentSuccessPage.subtotal')}
          </div>
          <div className="w-1/3 text-right text-body">
            {order.metaData.price}
          </div>
        </div>
        <div className="flex w-full py-2">
          <div className="flex-1 text-left text-body">
            {t('paymentSuccessPage.vat')} {order.metaData.vatRate}%
          </div>
          <div className="w-1/3 text-right text-body">{order.metaData.vat}</div>
        </div>
        {!!order.coupon?.couponUniqueNo && (
          <div className="flex w-full py-2">
            <div className="flex-1 text-left text-body">
              {t('paymentSuccessPage.discount')} ({order.coupon.couponUniqueNo})
            </div>
            <div className="w-1/3 text-right text-body">
              -{order.metaData.discount}
            </div>
          </div>
        )}
      </div>

      <div className="py-4">
        <div className="flex w-full py-2">
          <div className="flex-1 text-left text-heading font-semibold">
            {t('paymentSuccessPage.totalAmount')}
          </div>
          <div className="w-6/12 text-right text-heading font-semibold">
            {order.metaData.grandTotal} THB
          </div>
        </div>
      </div>
    </>
  );
}
