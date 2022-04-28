import { useRef, useState } from 'react';
import { useAuthInfo } from '../app-state/useAuthInfo';
import { FormikHelpers, FormikProps } from 'formik';
import { centralHttp, paymentHttp } from '../http';
import API_PATHS from '../constants/apiPaths';
import { SubscriptionPlan } from '../models/subscriptionPlan';
import { BaseResponseDto } from '../models/BaseResponse.dto';
import {
  GetBillingAddressDto,
  UpsertBillingAddressDto,
} from '../models/billingAddress';
import {
  BillingAddressOption,
  OfficeType,
  PaymentForm,
  PaymentOption,
  TaxType,
} from './paymentForm.schema';
import { trim } from 'lodash';
import { ERROR_CODES } from '../constants/errors';
import { ICart } from '../models/cart';
import useTranslation from '../i18n/useTranslation';
import { useModal } from '../ui-kit/Modal';
import config from '../config';

export interface PaymentResponseBody {
  paymentUrl: string;
}

export interface TaxInvoiceRequestBody {
  taxType: TaxType;
  officeType: OfficeType;
  taxEntityName: string;
  headOfficeOrBranch?: string;
  taxId: string;
  taxAddress: string;
  districtId: number;
  subdistrictId: number;
  provinceId: number;
  country: string;
  zipCode: string;
  contactPerson: string;
  contactPhoneNumber: string;
  contactEmail: string;
}

export function usePayment() {
  const [isInitializing, setInitializing] = useState(false);
  const [paymentResponse, setPaymentResponse] = useState<PaymentResponseBody>();
  const { context } = useAuthInfo();
  const [cart, setCart] = useState<ICart>();
  const [isCouponApplied, setCouponApplied] = useState<boolean>(false);
  const [isApplying, setApplying] = useState<boolean>(false);
  const [couponErrorMessage, setCouponErrorMessage] = useState(null);
  const timerRef = useRef(0);
  const [notifMessage, setNotifMessage] = useState(null);
  const { t } = useTranslation();
  const couponTimeoutModalProps = useModal();
  const installmentMinThb = 3000;

  async function initialize2c2pPayment(
    formik: FormikHelpers<PaymentForm>,
    paymentInfo: {
      redirectUrl: string;
      planId: string;
      paymentOptions: PaymentOption;
      issueTaxInvoice: boolean;
      taxInvoice?: TaxInvoiceRequestBody;
      billingAddressId?: string;
      couponCode?: string;
    },
  ) {
    setInitializing(true);
    try {
      const { data } = await paymentHttp.post<
        BaseResponseDto<PaymentResponseBody>
      >(API_PATHS.INITIALIZE_PAYMENT, {
        ...paymentInfo,
        email: context.token.user.email,
      });

      return data.data;
    } catch (err) {
      if (err.response.data.code === ERROR_CODES.CANNOT_UPGRADE_PLAN.code) {
        clearTimeout(timerRef.current);
        setNotifMessage('paymentPage.payment.contactAdmin');
        timerRef.current = window.setTimeout(() => {
          setNotifMessage(null);
        }, 5000);
      }
      if (
        err.response.data.code === ERROR_CODES.COUPON_NOT_FOUND.code ||
        err.response.data.code === ERROR_CODES.COUPON_INVALID.code
      ) {
        setNotifMessage('paymentPage.invalidCoupon');
        formik.setFieldValue('couponCode', '');
        await cancelCoupon();
      } else if (
        err.response.data.code === ERROR_CODES.COUPON_REDEMPTION_EXCEED.code
      ) {
        setNotifMessage('paymentPage.redemptionExceed');
        formik.setFieldValue('couponCode', '');
        await cancelCoupon();
      }
    } finally {
      setInitializing(false);
    }
  }

  async function handleFormSubmit(
    values: PaymentForm,
    formik: FormikHelpers<PaymentForm>,
    plan: SubscriptionPlan,
  ) {
    setInitializing(true);
    formik.setSubmitting(true);

    const { paymentOption, issueTaxInvoice, couponCode } = values;

    if (!issueTaxInvoice) {
      const data = await initialize2c2pPayment(formik, {
        redirectUrl: `${config.PAYMENT_API_BASE_URL}${API_PATHS.FRONTEND_CALLBACK}`,
        planId: plan.id,
        paymentOptions: paymentOption,
        issueTaxInvoice,
        couponCode: isCouponApplied ? couponCode : undefined,
      });

      setPaymentResponse(data);
      return;
    }

    const taxInvoicePayload: TaxInvoiceRequestBody = {
      taxType: values.taxType,
      officeType: values.officeType,
      taxEntityName: trim(values.taxEntityName),
      headOfficeOrBranch: trim(values.branch),
      taxId: trim(values.taxId),
      taxAddress: trim(values.taxAddress),
      districtId: values.taxDistrict.id,
      subdistrictId: values.taxSubdistrict.id,
      provinceId: values.taxProvince.id,
      country: 'TH',
      zipCode: values.taxPostalCode.zipCode,
      contactPerson: trim(values.taxContactPerson),
      contactPhoneNumber: trim(values.taxContactPhoneNumber),
      contactEmail: trim(values.taxContactEmail),
    };

    let billingAddressPayload: UpsertBillingAddressDto;
    let billingAddressId: string = undefined;
    if (values.billingOption === BillingAddressOption.SAME_AS_INVOICE) {
      billingAddressPayload = {
        billingAddress: trim(values.taxAddress),
        districtId: values.taxDistrict.id,
        subdistrictId: values.taxSubdistrict.id,
        provinceId: values.taxProvince.id,
        country: 'TH',
      };
    } else {
      billingAddressPayload = {
        billingAddress: trim(values.billingAddress),
        districtId: values.billingDistrict.id,
        subdistrictId: values.billingSubdistrict.id,
        provinceId: values.billingProvince.id,
        country: 'TH',
      };
      const billingResponse = await centralHttp.put<
        BaseResponseDto<GetBillingAddressDto>
      >(API_PATHS.MY_BILLING_ADDRESS, { ...billingAddressPayload });
      billingAddressId = billingResponse.data.data.id;
    }

    const data = await initialize2c2pPayment(formik, {
      redirectUrl: `${config.PAYMENT_API_BASE_URL}${API_PATHS.FRONTEND_CALLBACK}`,
      planId: plan.id,
      paymentOptions: paymentOption,
      issueTaxInvoice,
      taxInvoice: issueTaxInvoice ? { ...taxInvoicePayload } : undefined,
      billingAddressId,
      couponCode: isCouponApplied ? couponCode : undefined,
    });

    setPaymentResponse(data);
  }

  function isDisableInstallment() {
    return +cart?.total.grandTotal < installmentMinThb;
  }

  async function fetchCart(planId: string) {
    const { data } = await paymentHttp.get<BaseResponseDto<ICart>>(
      API_PATHS.CART_PLAN.replace(':planId', planId),
    );

    setCart(data.data);
    return data.data;
  }

  async function applyCoupon(code: string, formik: FormikProps<PaymentForm>) {
    if (!code || !cart) {
      return;
    }
    setApplying(true);
    setCouponErrorMessage(null);
    try {
      const { data } = await paymentHttp.get<BaseResponseDto<ICart>>(
        API_PATHS.CART_COUPON,
        {
          params: {
            planId: cart.plan.id,
            couponCode: code,
          },
        },
      );
      const refreshedCart = data.data;
      setCouponApplied(true);
      setCart(refreshedCart);
      if (
        +refreshedCart.total.grandTotal < installmentMinThb &&
        formik.values.paymentOption === PaymentOption.INSTALLMENT_PAYMENT
      ) {
        formik.setFieldValue('paymentOption', PaymentOption.CREDIT_CARD);
      }
    } catch (error) {
      if (
        error.response.data.code === ERROR_CODES.COUPON_NOT_FOUND.code ||
        error.response.data.code === ERROR_CODES.COUPON_INVALID.code
      ) {
        setCouponErrorMessage(t('paymentPage.invalidCoupon'));
      } else if (
        error.response.data.code === ERROR_CODES.COUPON_REDEMPTION_EXCEED.code
      ) {
        setCouponErrorMessage(t('paymentPage.redemptionExceed'));
      }
    }
    setApplying(false);
  }

  async function cancelCoupon() {
    if (!cart) {
      return;
    }
    setApplying(true);
    setCouponErrorMessage('');
    if (cart.coupon) {
      await paymentHttp.delete(
        API_PATHS.CART_COUPON_ID.replace(':id', cart.coupon.coupon.id),
      );
    }
    const newCart = await fetchCart(cart.plan.id);
    setCart(newCart);
    setCouponApplied(false);
    setApplying(false);
  }

  function handleCouponTimeout() {
    couponTimeoutModalProps.toggle();
  }

  function handleReapplyCoupon() {
    window.location.reload();
  }

  return {
    isInitializing,
    paymentResponse,
    handleFormSubmit,
    isDisableInstallment,
    notifMessage,
    cart,
    fetchCart,
    isCouponApplied,
    applyCoupon,
    cancelCoupon,
    isApplying,
    couponErrorMessage,
    couponTimeoutModalProps,
    handleCouponTimeout,
    handleReapplyCoupon,
  };
}
