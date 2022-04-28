import cx from 'classnames';
import { differenceInSeconds, isAfter } from 'date-fns';
import { Formik, FormikProps } from 'formik';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect } from 'react';
import useTranslation from '../i18n/useTranslation';
import Layout from '../layouts/main.layout';
import Button from '../ui-kit/Button';
import { FadeMessage } from '../ui-kit/FadeMessage';
import MinimalNavbar from '../ui-kit/headers/MinimalNavbar';
import { Card } from './Card';
import { CartTotal } from './CartTotal';
import { CouponTimeoutModal } from './CouponTimeoutModal';
import { Invoice } from './Invoice';
import { OrderItem } from './OrderItem';
import PaymentFormSchema, {
  BillingAddressOption,
  OfficeType,
  PaymentForm,
  PaymentOption,
  TaxType,
} from './paymentForm.schema';
import { usePayment } from './usePayment';

export default function PaymentPage(props) {
  const { token } = props;
  const {
    handleFormSubmit,
    isInitializing,
    isDisableInstallment,
    notifMessage,
    cart,
    applyCoupon,
    isApplying,
    fetchCart,
    couponErrorMessage,
    cancelCoupon,
    handleCouponTimeout,
    couponTimeoutModalProps,
    handleReapplyCoupon,
    paymentResponse,
  } = usePayment();

  const { t } = useTranslation();
  const disableInstallment = isDisableInstallment();
  const router = useRouter();
  const { planId } = router.query;

  useEffect(() => {
    fetchCart(planId as string);
  }, [planId]);

  useEffect(() => {
    if (paymentResponse?.paymentUrl) {
      window.location.href = paymentResponse.paymentUrl;
    }
  }, [paymentResponse]);

  const cardSection = (checked: boolean) => (
    <>
      <img
        src="/assets/brand-mastercard.svg"
        width="24"
        alt="mastercard icon"
      />
      {checked && (
        <>
          <img
            className="lg:hidden"
            src="/assets/brand-visa.svg"
            width="24"
            alt="visa icon"
          />
          <img
            className="hidden lg:block"
            src="/assets/brand-visa-white.svg"
            width="24"
            alt="visa icon"
          />
        </>
      )}
      {!checked && (
        <img src="/assets/brand-visa.svg" width="24" alt="visa icon" />
      )}
    </>
  );

  const proceedToPaymentFragment = useCallback(
    (formik: FormikProps<PaymentForm>) => {
      const coupon = cart?.coupon;
      const currDate = new Date();
      const couponLockDate = coupon ? new Date(coupon.lockExpiresOn) : null;

      return (
        <>
          <Button
            variant="primary"
            size="medium"
            type="button"
            onClick={formik.submitForm}
            disabled={
              isInitializing ||
              isApplying ||
              couponErrorMessage ||
              (coupon &&
                (isAfter(currDate, couponLockDate) ||
                  differenceInSeconds(couponLockDate, currDate) <= 1))
            }
            className="font-semibold text-white"
          >
            {t('paymentPage.payment.proceedToPayment')}
          </Button>
          <footer className="mt-3 flex items-center justify-center space-x-1 text-caption">
            <div>{t('paymentPage.payment.paymentSecuredBy')}</div>
            <img src="/assets/2c2p.png" width={60} alt="2c2p logo" />
          </footer>
        </>
      );
    },
    [
      isInitializing,
      isApplying,
      couponErrorMessage,
      cart?.coupon,
      couponTimeoutModalProps.isOpen,
    ],
  );

  if (!cart) {
    return null;
  }
  const { plan, total, coupon } = cart;
  return (
    <Layout token={token} header={<MinimalNavbar />} boxedContent={true}>
      <Head>
        <title>{t('paymentPage.pageTitle')}</title>
      </Head>
      {notifMessage && (
        <div className="sticky top-16 z-10 mx-6 max-h-0 lg:top-36 lg:mx-auto lg:min-w-256">
          <FadeMessage type="error" title={t(notifMessage)} hasClose />
        </div>
      )}
      <Formik<PaymentForm>
        initialValues={{
          paymentOption: PaymentOption.CREDIT_CARD,
          billingOption: BillingAddressOption.SAME_AS_INVOICE,
          billingCountry: t('address.thailand'),
          billingProvince: undefined,
          billingDistrict: undefined,
          billingSubdistrict: undefined,
          billingPostalCode: undefined,
          billingAddress: '',
          issueTaxInvoice: false,
          taxType: TaxType.INDIVIDUAL,
          taxEntityName: '',
          officeType: OfficeType.HEAD_OFFICE,
          branch: '',
          taxId: '',
          taxCountry: t('address.thailand'),
          taxProvince: undefined,
          taxDistrict: undefined,
          taxSubdistrict: undefined,
          taxPostalCode: undefined,
          taxAddress: '',
          taxContactPerson: '',
          taxContactEmail: '',
          taxContactPhoneNumber: '',
          addressOption: [
            { label: t('paymentPage.invoice.addAnAddress'), value: null },
          ],
          couponCode: '',
        }}
        validationSchema={PaymentFormSchema}
        onSubmit={(values, formik) => handleFormSubmit(values, formik, plan)}
      >
        {(formik) => {
          return (
            <form
              onSubmit={formik.handleSubmit}
              className="lg:flex lg:space-x-26"
              method="post"
            >
              <article className="flex-1">
                <header className="text-heading font-bold">
                  {t('paymentPage.paymentOption.selectPayment')}
                </header>
                <section className="mt-8 flex flex-col space-y-4 lg:flex-row lg:space-x-4 lg:space-y-0">
                  <Card
                    value={PaymentOption.CREDIT_CARD}
                    name="paymentOption"
                    description={(checked) => (
                      <>
                        <div className="text-caption font-semibold">
                          {t('paymentPage.paymentOption.fullPayment')}
                        </div>
                        <div
                          className={cx(
                            'text-footnote text-gray-500',
                            checked ? 'lg:text-white' : '',
                          )}
                        >
                          {t('paymentPage.paymentOption.creditDebitCard')}
                        </div>
                      </>
                    )}
                    cardIcon={(checked) => cardSection(checked)}
                  />
                  <Card
                    value={PaymentOption.QR_CODE}
                    name="paymentOption"
                    description={(checked) => (
                      <>
                        <div className="text-caption font-semibold">
                          {t('paymentPage.paymentOption.fullPayment')}
                        </div>
                        <div
                          className={cx(
                            'text-footnote text-gray-500',
                            checked ? 'lg:text-white' : '',
                          )}
                        >
                          {t('paymentPage.paymentOption.qrPromptpay')}
                        </div>
                      </>
                    )}
                    cardIcon={() => (
                      <img src="/assets/brand-promptpay.png" width={60} />
                    )}
                  />
                  <Card
                    value={PaymentOption.INSTALLMENT_PAYMENT}
                    name="paymentOption"
                    description={(checked) => (
                      <>
                        <div
                          className={cx(
                            'text-caption font-semibold',
                            disableInstallment ? 'text-gray-500' : '',
                          )}
                        >
                          {t('paymentPage.paymentOption.installment')}
                        </div>
                        <div
                          className={cx(
                            'text-footnote text-gray-500',
                            checked ? 'lg:text-white' : '',
                          )}
                        >
                          {disableInstallment
                            ? t('paymentPage.paymentOption.installmentDisabled')
                            : t('paymentPage.paymentOption.creditCard')}
                        </div>
                      </>
                    )}
                    cardIcon={(checked) =>
                      disableInstallment ? null : cardSection(checked)
                    }
                    disabled={disableInstallment}
                  />
                </section>
                <hr className="my-8 border-gray-200" />
                <header className="text-heading font-bold">
                  {t('paymentPage.order.yourOrder')}
                </header>
                <section className="mt-8 space-y-8">
                  <OrderItem plan={plan} />
                </section>
                <hr className="my-8 border-gray-200" />
                <Invoice formik={formik} />
                {!formik.values.issueTaxInvoice && (
                  <div className="pt-6 text-footnote text-gray-500 lg:pt-8">
                    <p>{t('paymentPage.invoice.witholdtax_1')}</p>
                    <p className="pt-4">
                      <span className="text-black">
                        {t('paymentPage.invoice.witholdtax_2')}
                      </span>{' '}
                      {t('paymentPage.invoice.witholdtax_3')}
                    </p>
                  </div>
                )}
              </article>
              <article className="mt-6 lg:sticky lg:top-32 lg:mt-0 lg:max-w-md lg:self-start">
                <CartTotal
                  subTotal={total.subTotal}
                  vat={total.vat}
                  vatRate={total.vatRate}
                  discount={total.discount}
                  grandTotal={total.grandTotal}
                  proceedToPaymentSection={
                    <div className="hidden lg:block">
                      {proceedToPaymentFragment(formik)}
                    </div>
                  }
                  onApplyCoupon={() =>
                    applyCoupon(formik.values.couponCode, formik)
                  }
                  isApplying={isApplying}
                  couponErrorMessage={couponErrorMessage}
                  onCancelCoupon={cancelCoupon}
                  couponCode={coupon?.coupon.couponUniqueNo}
                  lockExpiresOn={
                    coupon ? new Date(coupon.lockExpiresOn) : undefined
                  }
                  onLockTimeout={handleCouponTimeout}
                />
                <CouponTimeoutModal
                  {...couponTimeoutModalProps}
                  onOk={handleReapplyCoupon}
                  onCancel={cancelCoupon}
                />
              </article>
              <article className="sticky bottom-0 bg-white py-6 lg:hidden">
                {proceedToPaymentFragment(formik)}
              </article>
            </form>
          );
        }}
      </Formik>
    </Layout>
  );
}
