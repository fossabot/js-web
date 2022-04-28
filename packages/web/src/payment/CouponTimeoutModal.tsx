import { Dialog } from '@headlessui/react';
import { useField } from 'formik';
import { Dispatch, FC, useRef } from 'react';
import useTranslation from '../i18n/useTranslation';
import Button from '../ui-kit/Button';
import { Modal } from '../ui-kit/HeadlessModal';

export interface IConfirmRemoveAddressModal {
  isOpen: boolean;
  toggle: Dispatch<boolean>;
  onOk: Dispatch<void>;
  onCancel: Dispatch<void>;
}

export const CouponTimeoutModal: FC<IConfirmRemoveAddressModal> = (props) => {
  const { toggle, onOk, onCancel } = props;
  const initialFocusRef = useRef(null);
  const { t } = useTranslation();
  const [, , helper] = useField('couponCode');

  return (
    <Modal
      {...props}
      initialFocusRef={initialFocusRef}
      className="p-5"
      skipOutsideClickEvent
    >
      <Dialog.Overlay />
      <Dialog.Title
        as="div"
        className="lg:inline-flex lg:items-center lg:space-x-5"
      >
        <img src="/assets/coupon-expired.png" className="m-auto w-24" />
        <div className="mt-4 lg:mt-0">
          <div className="text-center text-subheading font-semibold lg:text-left">
            {t('paymentPage.couponTimeout.title')}
          </div>
          <div className="mt-4 text-center text-gray-650 lg:text-left">
            {t('paymentPage.couponTimeout.passRemainingTime')}
          </div>
        </div>
      </Dialog.Title>
      <div className="mt-8 space-y-3 lg:flex lg:flex-row-reverse lg:space-y-0">
        <div className="max-w-25 lg:ml-3">
          <Button
            ref={initialFocusRef}
            size="medium"
            variant="ghost"
            className="bg-brand-primary font-semibold text-white"
            onClick={() => onOk()}
          >
            {t('paymentPage.couponTimeout.applyCouponAgain')}
          </Button>
        </div>
        <div className="max-w-25">
          <Button
            size="medium"
            variant="secondary"
            className="font-semibold"
            onClick={() => {
              helper.setValue('');
              toggle(false);
              onCancel();
            }}
          >
            {t('paymentPage.couponTimeout.cancel')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
