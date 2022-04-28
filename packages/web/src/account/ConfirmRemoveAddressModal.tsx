import { Dialog } from '@headlessui/react';
import { Dispatch, FC, useRef } from 'react';
import useTranslation from '../i18n/useTranslation';
import Button from '../ui-kit/Button';
import { Modal } from '../ui-kit/HeadlessModal';
import { Warning } from '../ui-kit/icons';

export interface IConfirmRemoveAddressModal {
  isOpen: boolean;
  toggle: Dispatch<boolean>;
  onOk: Dispatch<void>;
}

export const ConfirmRemoveAddressModal: FC<IConfirmRemoveAddressModal> = (
  props,
) => {
  const { toggle, onOk } = props;
  const initialFocusRef = useRef(null);
  const { t } = useTranslation();

  return (
    <Modal
      {...props}
      initialFocusRef={initialFocusRef}
      className="p-5 lg:w-max"
    >
      <Dialog.Overlay />
      <Dialog.Title
        as="div"
        className="lg:inline-flex lg:items-center lg:space-x-5"
      >
        <Warning
          className="m-auto text-red-200 lg:scale-75 lg:transform"
          width={50}
          height={50}
        />
        <div className="mt-5 text-center text-subheading font-semibold lg:mt-0">
          {t('addressListPage.modalRemoveAddressTitle')}
        </div>
      </Dialog.Title>
      <ul className="mt-2 ml-5 list-disc text-caption text-gray-650 lg:ml-20">
        <li>{t('addressListPage.modalRemoveAddressNoticeSelect')}</li>
        <li>{t('addressListPage.modalRemoveAddressNoticePurchaseHistory')}</li>
        <li>{t('addressListPage.modalRemoveAddressNoticeUndoneAction')}</li>
      </ul>
      <div className="mt-8 space-y-4 lg:flex lg:flex-row-reverse lg:space-y-0">
        <div className="max-w-25 lg:ml-3">
          <Button
            ref={initialFocusRef}
            size="medium"
            variant="ghost"
            className="bg-red-200 font-semibold text-white"
            onClick={() => onOk()}
          >
            {t('addressListPage.modalRemoveAddressOk')}
          </Button>
        </div>
        <div className="max-w-25">
          <Button
            size="medium"
            variant="secondary"
            className="font-semibold"
            onClick={() => toggle(false)}
          >
            {t('addressListPage.modalRemoveAddressCancel')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
