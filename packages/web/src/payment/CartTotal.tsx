import { Field, useField } from 'formik';
import numeral from 'numeral';
import React, { Dispatch, FC, useCallback, useEffect, useState } from 'react';
import useTranslation from '../i18n/useTranslation';
import { CloseCircle, Tag } from '../ui-kit/icons';
import InputSection from '../ui-kit/InputSection';
import { differenceInSeconds } from 'date-fns';
import { padStart } from 'lodash';
import { CountdownTimer } from '../ui-kit/CountdownTimer';
import { PRICE_FORMAT } from '../constants/numeralFormat';

export interface ICartTotal {
  subTotal: string;
  vat: string;
  vatRate: string;
  discount: string;
  grandTotal: string;
  couponCode?: string;
  proceedToPaymentSection?: React.ReactNode;
  onApplyCoupon: Dispatch<any>;
  isApplying?: boolean;
  couponErrorMessage?: string;
  onCancelCoupon: (evt) => any;
  lockExpiresOn?: Date;
  onLockTimeout?: Dispatch<void>;
}

export const CartTotal: FC<ICartTotal> = (props) => {
  const {
    proceedToPaymentSection,
    onApplyCoupon,
    isApplying,
    subTotal,
    vat,
    vatRate,
    discount,
    grandTotal,
    couponErrorMessage,
    onCancelCoupon,
    couponCode,
    lockExpiresOn,
    onLockTimeout,
  } = props;
  const { t } = useTranslation();
  const [field, , helper] = useField('couponCode');
  const [lockSecondsRemaining, setLockSecondsRemaining] = useState<number>(-1);

  const lockExpiresOnTime = lockExpiresOn
    ? new Date(lockExpiresOn).getTime()
    : undefined;

  const handleSetLockSecondsRemaining = useCallback(() => {
    if (lockExpiresOnTime) {
      const diff = differenceInSeconds(new Date(lockExpiresOnTime), new Date());
      if (diff > 0) {
        setLockSecondsRemaining(diff);
      }
    }
  }, [lockExpiresOnTime]);

  useEffect(() => {
    const onFocus = () => {
      handleSetLockSecondsRemaining();
    };
    window.addEventListener('focus', onFocus);

    return () => {
      window.removeEventListener('focus', onFocus);
    };
  }, [handleSetLockSecondsRemaining]);

  useEffect(() => {
    handleSetLockSecondsRemaining();
  }, [handleSetLockSecondsRemaining]);

  async function handleCancelCoupon(event: MouseEvent) {
    helper.setValue('');
    await onCancelCoupon(event);
  }

  async function handleOnChangeCoupon(event: any) {
    const value = event.target.value;

    helper.setValue(value);
    if (!value) {
      await onCancelCoupon(event);
      event.target.focus();
    }
  }

  return (
    <article className="-mx-5 rounded-xl bg-gray-100 p-6 lg:mx-auto">
      <header className="mb-6 hidden text-heading font-bold lg:block">
        {t('paymentPage.cartTotal.cartTotal')}
      </header>
      <article className="flex flex-col">
        {couponCode ? (
          <>
            <aside className="flex items-center justify-between rounded-lg bg-maroon-100 py-2.5 px-3.5 text-maroon-600">
              <div className="flex items-center space-x-2">
                <Tag />
                <div className="text-caption font-semibold">{couponCode}</div>
              </div>
              <CloseCircle
                className="h-5 w-5 cursor-pointer"
                onClick={handleCancelCoupon}
              />
            </aside>
            <aside className="mt-2 flex justify-center space-x-2 border border-gray-200 bg-white p-1 text-center">
              <div className="text-gray-650">
                {t('paymentPage.remainingTime')}
              </div>
              <div className="w-20 text-left font-bold text-brand-primary">
                <CountdownTimer
                  seconds={lockSecondsRemaining}
                  onTimeout={onLockTimeout}
                >
                  {(seconds) => (
                    <>
                      {`${padStart(
                        Math.floor(seconds / 60).toString(),
                        2,
                        '0',
                      )}:${padStart(String(seconds % 60), 2, '0')}`}
                    </>
                  )}
                </CountdownTimer>
              </div>
            </aside>
          </>
        ) : (
          <>
            <Field
              name="couponCode"
              as={InputSection}
              placeholder={t('paymentPage.couponVoucher')}
              withInlineButtonProps={{
                text: t('paymentPage.apply'),
                buttonProps: {
                  onClick: onApplyCoupon,
                  className: 'text-white',
                  disabled: isApplying,
                  type: 'button',
                },
                backgroundColorClassName: 'bg-brand-primary',
                loading: isApplying,
              }}
              inputFieldWrapperClassName="mb-2"
              disabled={isApplying}
              error={couponErrorMessage}
              hideErrorMessage
              withInlineTextAndIconProps={{
                icon: field.value && (
                  <CloseCircle
                    className="absolute right-25 block h-5 w-5 cursor-pointer text-black"
                    onClick={handleCancelCoupon}
                  />
                ),
              }}
              onChange={handleOnChangeCoupon}
              autoFocus
            />
            {couponErrorMessage && (
              <div className="text-footnote font-semibold text-red-200">
                {couponErrorMessage}
              </div>
            )}
          </>
        )}
        <section className="mt-4 flex justify-between text-caption">
          <div>{t('paymentPage.cartTotal.subtotal')}</div>
          <div>
            <span>{numeral(subTotal).format(PRICE_FORMAT)} </span>
            <span className="text-gray-500"> {t('currency.thb')}</span>
          </div>
        </section>
        <section className="mt-4 flex justify-between text-caption">
          <div>
            {t('paymentPage.cartTotal.vat')} {vatRate}%
          </div>
          <div>
            <span>{numeral(vat).format(PRICE_FORMAT)}</span>
            <span className="text-gray-500"> {t('currency.thb')}</span>
          </div>
        </section>
        {+discount > 0 && (
          <section className="mt-4 flex justify-between text-caption">
            <div>{t('paymentPage.discount')}</div>
            <div>
              <span>-{numeral(discount).format(PRICE_FORMAT)}</span>
              <span className="text-gray-500"> {t('currency.thb')}</span>
            </div>
          </section>
        )}
        <hr className="mt-4 border-gray-200" />
        <section className="mt-3 flex justify-between">
          <div className="text-body font-semibold">
            {t('paymentPage.cartTotal.totalAmount')}
          </div>
          <div>
            <span className="text-body font-semibold">
              {numeral(grandTotal).format(PRICE_FORMAT)}
            </span>
            <span className="text-caption text-gray-500">
              {' '}
              {t('currency.thb')}
            </span>
          </div>
        </section>
      </article>
      <article className="mt-8 text-center text-footnote text-gray-500">
        <p>
          {t('paymentPage.cartTotal.terms', {
            termsAndConditions: (
              <span className="text-black underline">
                {t('paymentPage.cartTotal.termsAndConditions')}
              </span>
            ),
            cancellationPolicy: (
              <span className="text-black underline">
                {t('paymentPage.cartTotal.cancellationPolicy')}
              </span>
            ),
          })}
        </p>
      </article>
      <article className="mt-8">{proceedToPaymentSection}</article>
    </article>
  );
};
