import { FC } from 'react';
import { Dialog } from '@headlessui/react';

import Button from '../../ui-kit/Button';
import { Close } from '../../ui-kit/icons';
import { Modal } from '../../ui-kit/HeadlessModal';
import useTranslation from '../../i18n/useTranslation';

interface IRemovePoliciesFromRoleModal {
  isOpen: boolean;
  toggle: (bool?) => void;
  onConfirm: () => Promise<void>;
  headerText: string;
}

const RemovePoliciesFromRoleModal: FC<IRemovePoliciesFromRoleModal> = ({
  isOpen,
  toggle,
  onConfirm,
  headerText,
}) => {
  const { t } = useTranslation();

  const onCloseModal = () => {
    toggle(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={onCloseModal}
      skipOutsideClickEvent
      className="w-344px space-y-4 p-5 lg:w-472px lg:p-8"
    >
      <Dialog.Title as="div" className="flex flex-row justify-between">
        <p className="text-heading font-bold">{headerText}</p>
        <Close
          className="h-6 w-6 cursor-pointer text-black hover:text-gray-600"
          onClick={() => onCloseModal()}
        />
      </Dialog.Title>
      <div className="flex flex-col space-y-4">
        <div className="flex w-2/4 flex-row justify-between space-x-4 self-end">
          <Button
            className="font-semibold"
            size="medium"
            variant="secondary"
            type="button"
            onClick={() => onCloseModal()}
          >
            {t('cancel')}
          </Button>
          <Button
            className="font-semibold"
            size="medium"
            variant="primary"
            type="button"
            onClick={() => onConfirm()}
          >
            {t('confirm')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default RemovePoliciesFromRoleModal;
