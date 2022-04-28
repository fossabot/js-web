import Link from 'next/link';
import PaymentSuccessHeader from './PaymentSuccessHeader';
import OrderSummary from './OrderSummary';
import PaymentInfo from './PaymentInfo';
import WEB_PATHS from '../constants/webPaths';
import useTranslation from '../i18n/useTranslation';
import { ArrowRight, ChevronRight } from '../ui-kit/icons';
import { IOrder } from '../models/order';

export default function PaymentSuccessPage({ order }: { order: IOrder }) {
  const { t } = useTranslation();

  return (
    <>
      <div className="w-full lg:px-20">
        <PaymentSuccessHeader
          name={order.user.firstName || order.user.lastName}
        />
        <div className="lg:flex lg:justify-between">
          <div className="px-3 lg:w-3/6 lg:px-2">
            <OrderSummary order={order} />
          </div>
          <div className="-mx-5 mt-2 bg-gray-100 p-8 lg:mx-0 lg:mt-0 lg:w-4/12 lg:rounded-2xl">
            <PaymentInfo order={order} />
          </div>
        </div>
        <div className="mt-8 text-left lg:text-right">
          <Link href={WEB_PATHS.MY_PACKAGES}>
            <a className="text-caption font-semibold text-brand-primary">
              <span>{t('paymentSuccessPage.viewMyPackages')}</span>
              <ArrowRight className="align-middle-mt-0.5 ml-1 hidden h-5 w-5 lg:inline-block" />
              <ChevronRight className="ml-1 -mt-0.5 inline-block h-5 w-5 align-middle lg:hidden" />
            </a>
          </Link>
        </div>
      </div>
    </>
  );
}
