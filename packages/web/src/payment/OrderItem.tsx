import numeral from 'numeral';
import pluralize from 'pluralize';
import { FC } from 'react';
import useTranslation from '../i18n/useTranslation';
import {
  DurationInterval,
  InstancyPackageType,
  SubscriptionPlan,
} from '../models/subscriptionPlan';

export interface IOrderItem {
  plan: SubscriptionPlan;
}

export const OrderItem: FC<IOrderItem> = (props) => {
  const { plan } = props;
  const { name, durationInterval, durationValue, price, packageType } = plan;
  const { t } = useTranslation();

  let iconSource = '/assets/course/communication.svg';
  if (packageType === InstancyPackageType.VIRTUAL) {
    iconSource = '/assets/course/virtual.svg';
  }

  let durationText: string;
  switch (durationInterval) {
    case DurationInterval.DAY:
      durationText = t('paymentPage.order.day');
      break;
    case DurationInterval.MONTH:
      durationText = t('paymentPage.order.month');
      break;
    case DurationInterval.YEAR:
      durationText = t('paymentPage.order.year');
      break;
    default:
      durationText = '';
  }

  return (
    <section className="flex space-x-4">
      <figure>
        <img src={iconSource} alt="course logo" />
      </figure>
      <section className="flex-1 space-y-2">
        <p className="text-caption font-semibold">{name}</p>
        <p className="w-24 rounded-2xl bg-orange-100 text-center text-footnote font-semibold text-orange-400">
          {`${durationValue} ${pluralize(durationText, durationValue)}`}
        </p>
      </section>
      <section>
        <p className="flex space-x-1 text-right">
          <s className="hidden text-gray-400"></s>
          <span className="text-caption font-semibold">
            {numeral(price).format('0,0.00')} {t('currency.thb')}
          </span>
        </p>
      </section>
    </section>
  );
};
