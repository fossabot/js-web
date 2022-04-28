import { Dialog } from '@headlessui/react';
import { Dispatch, useEffect, useState } from 'react';
import useTranslation from '../../i18n/useTranslation';
import Button from '../../ui-kit/Button';
import { Modal } from '../../ui-kit/HeadlessModal';
import { Close } from '../../ui-kit/icons';

interface IDeleteCertificateModalProps {
  isOpen: boolean;
  toggle: Dispatch<boolean>;
  onDelete: () => void;
}

export const DeleteCertificateModal = ({
  isOpen,
  toggle,
  onDelete,
}: IDeleteCertificateModalProps) => {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isOpen) setIsDeleting(false);
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      skipFullWidth
      className="w-344px p-5 lg:w-472px lg:p-8"
    >
      <Dialog.Title as="div" className="flex justify-between">
        <span className="text-subheading font-semibold text-gray-900">
          {t('certificateListPage.deleteModalTitle')}
        </span>
        <Close
          className="h-6 w-6 cursor-pointer text-gray-650 hover:text-gray-600"
          onClick={() => {
            if (!isDeleting) {
              toggle(false);
            }
          }}
        />
      </Dialog.Title>

      <div className="flex justify-end">
        <Button
          avoidFullWidth
          className="mr-2 font-semibold"
          size="medium"
          variant="secondary"
          type="button"
          onClick={() => {
            if (!isDeleting) {
              toggle(false);
            }
          }}
        >
          {t('certificateListPage.cancel')}
        </Button>
        <Button
          avoidFullWidth
          className="ml-2 font-semibold"
          size="medium"
          variant="primary"
          type="button"
          onClick={async () => {
            try {
              setIsDeleting(true);
              await onDelete();
            } catch (err) {
              console.error(err);
            } finally {
              setIsDeleting(false);
            }
          }}
          isLoading={isDeleting}
          disabled={isDeleting}
        >
          {t('certificateListPage.delete')}
        </Button>
      </div>
    </Modal>
  );
};
