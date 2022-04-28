import useTranslation from '../i18n/useTranslation';
import {
  DEFAULT_DATE_FORMAT,
  DEFAULT_TIME_FORMAT,
} from '../constants/datetime';
import { formatWithTimezone } from '../utils/date';
import { Clock, Phone, Mail } from '../ui-kit/icons';
import { getLocaleTitle } from '../i18n/lang-utils';
import { useEffect, useState } from 'react';

function getAddressText(invoice, localeTitle = 'En') {
  if (!invoice) return '';

  const obj = invoice.billingAddress || invoice;
  const address = obj.taxAddress || obj.billingAddress;

  const addressParts = [
    address,
    obj.subdistrict ? obj.subdistrict[`subdistrictName${localeTitle}`] : '',
    obj.district ? obj.district[`districtName${localeTitle}`] : '',
    obj.province ? obj.province[`provinceName${localeTitle}`] : '',
    obj.country,
    obj.subdistrict?.zipCode,
  ];
  const parts = addressParts
    .map((str) => (str ? str.trim() : ''))
    .filter((str) => str);
  return parts.join(', ');
}

export default function PaymentInfo({ order }) {
  const { t } = useTranslation();
  const localeTitle = getLocaleTitle();
  const [purchaseDate, setPurchaseDate] = useState<string>('');
  const [purchaseTime, setPurchaseTime] = useState<string>('');

  const { createdAt, transaction, taxInvoice } = order;

  useEffect(() => {
    const dateOfPurchase = transaction
      ? new Date(transaction.createdAt)
      : new Date(createdAt);
    setPurchaseDate(formatWithTimezone(dateOfPurchase, DEFAULT_DATE_FORMAT));
    setPurchaseTime(formatWithTimezone(dateOfPurchase, DEFAULT_TIME_FORMAT));
  }, [transaction]);

  return (
    <>
      {order.invoiceNumber && (
        <>
          <div className="mb-3 text-caption font-semibold text-gray-500">
            {t('paymentSuccessPage.paymentNumber')}
          </div>
          <div className="mb-8 text-subtitle font-bold">
            {order.invoiceNumber}
          </div>
        </>
      )}

      {!!purchaseDate && !!purchaseTime && (
        <>
          <div className="mb-3 text-caption font-semibold text-gray-500">
            {t('paymentSuccessPage.dateOfPurchase')}
          </div>
          <div className="mb-2 text-body font-bold">{purchaseDate}</div>
          <div className="mb-8 flex items-center text-body text-gray-600">
            <Clock className="mr-2" />
            <div>{purchaseTime}</div>
          </div>
        </>
      )}

      {transaction && transaction.paymentInfo && (
        <>
          <div className="mb-3 text-caption font-semibold text-gray-500">
            {t('paymentSuccessPage.paymentMethod')}
          </div>
          <div className="mb-2 text-body font-bold">
            {transaction.paymentInfo.paymentChannel === 'IPP_TRANSACTION'
              ? t('paymentSuccessPage.paymentTypes.installmentPayment')
              : t('paymentSuccessPage.paymentTypes.fullPayment')}
          </div>
          {transaction.paymentInfo.cardEnding && (
            <div className="mb-8 flex items-center text-body text-gray-600">
              <div className="mr-2">
                <img src="/assets/visa.webp" />
              </div>
              <div>
                {t('paymentSuccessPage.creditCardEnding')}{' '}
                <span>••{transaction.paymentInfo.cardEnding}</span>
              </div>
            </div>
          )}
        </>
      )}

      {taxInvoice && (
        <>
          <div className="mb-3 text-caption font-semibold text-gray-500">
            {t('paymentSuccessPage.invoiceAddress')}
          </div>
          <div className="mb-2 text-body font-bold">
            {taxInvoice.taxEntityName}
          </div>
          <div className="mb-8 text-body">
            <div className="text-gray-600">
              {getAddressText(taxInvoice, localeTitle)}
            </div>
            {taxInvoice.taxId && (
              <div className="font-bold">Tax ID: {taxInvoice.taxId}</div>
            )}
          </div>

          <div className="mb-3 text-caption font-semibold text-gray-500">
            {t('paymentSuccessPage.contactInfo')}
          </div>
          <div className="mb-2 text-body font-bold">
            {taxInvoice.contactPerson}
          </div>
          <div className="mb-8 text-body">
            {taxInvoice.contactEmail && (
              <div className="flex items-center text-gray-600">
                <Mail className="mr-2" />
                <span>{taxInvoice.contactEmail}</span>
              </div>
            )}
            {taxInvoice.contactPhoneNumber && (
              <div className="flex items-center text-gray-600">
                <Phone className="mr-2" />
                <span>{taxInvoice.contactPhoneNumber}</span>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
