import { Dialog } from '@headlessui/react';
import { Dispatch, FC, useRef } from 'react';
import useTranslation from '../../i18n/useTranslation';
import Button from '../../ui-kit/Button';
import { Modal } from '../../ui-kit/HeadlessModal';

export interface ICancelPrivateSessionModal {
  isOpen: boolean;
  toggle: Dispatch<boolean>;
}

const CancelPrivateSessionModal: FC<ICancelPrivateSessionModal> = (props) => {
  const { toggle } = props;
  const initialFocusRef = useRef(null);
  const { t } = useTranslation();

  return (
    <Modal
      {...props}
      initialFocusRef={initialFocusRef}
      className="p-5 lg:w-max lg:p-8"
    >
      <Dialog.Overlay />
      <Dialog.Title
        as="div"
        className="lg:inline-flex lg:items-center lg:space-x-5"
      >
        <div className="text-center text-subheading font-semibold">
          {t('dashboardBookingsWaitingRoom.cancelPrivateSessionModal.title')}
        </div>
      </Dialog.Title>
      <div className="my-4 text-gray-650 lg:w-400px">
        {t(
          'dashboardBookingsWaitingRoom.cancelPrivateSessionModal.description',
        )}
      </div>
      <div className="mt-4 space-y-4 lg:mt-8 lg:flex lg:flex-row-reverse lg:space-y-0">
        <div className="max-w-25">
          <Button
            ref={initialFocusRef}
            size="medium"
            variant="primary"
            className="font-semibold"
            onClick={() => toggle(false)}
          >
            {t('dashboardBookingsWaitingRoom.cancelPrivateSessionModal.close')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CancelPrivateSessionModal;
