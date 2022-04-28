import { Dialog } from '@headlessui/react';
import { useEffect, useRef, useState } from 'react';
import API_PATHS from '../../constants/apiPaths';
import { notificationHttp } from '../../http';
import { IEmailLog } from '../../models/emailLogs';
import Button from '../../ui-kit/Button';
import { Modal } from '../../ui-kit/HeadlessModal';
import { Warning } from '../../ui-kit/icons';

export interface IResendEmailModalProps {
  data: IEmailLog | null;
  toggle: () => void;
  onResend: (data: IEmailLog) => void;
}

export const ResendEmailModal = ({
  data,
  toggle,
  onResend,
}: IResendEmailModalProps) => {
  const [isResending, setIsResending] = useState(false);
  const [hasError, setHasError] = useState(false);
  const focusRef = useRef(null);

  const handleResend = async () => {
    if (data) {
      setIsResending(true);
      try {
        await notificationHttp.post(
          API_PATHS.USER_EMAIL_NOTIFICATIONS_RESEND.replace(':id', data.id),
        );
        onResend(data);
        toggle();
      } catch (err) {
        setHasError(true);
      } finally {
        setIsResending(false);
      }
    }
  };

  useEffect(() => {
    if (data) {
      setHasError(false);
      setIsResending(false);
    }
  }, [data]);

  return (
    <Modal
      isOpen={data !== null}
      toggle={toggle}
      skipFullWidth
      initialFocusRef={focusRef}
      className="box-content w-140 p-5 lg:p-8"
      skipOutsideClickEvent
    >
      <Dialog.Title as="div" className="flex items-center">
        {hasError && <Warning className="mr-4 h-8 w-8 text-red-200"></Warning>}
        <span className="text-subheading font-semibold text-black">
          {hasError
            ? 'Cannot resend this email notification'
            : 'Resend this email notification?'}
        </span>
      </Dialog.Title>
      {hasError && (
        <p className="mt-4 text-gray-650">
          This action cannot be done due to the system limitation
        </p>
      )}

      {data && (
        <div className="mt-6 space-y-2 rounded-2xl border border-gray-200 p-4">
          <p>
            <span className="font-bold">Category: </span> {data.category}
          </p>
          <p>
            <span className="font-bold">Topic: </span> {data.subject}
          </p>
          <p>
            <span className="font-bold">Sent to: </span> {data.user.email}
          </p>
        </div>
      )}

      <div className="mt-10 flex items-center justify-end space-x-4">
        <Button
          variant="secondary"
          size="medium"
          avoidFullWidth
          onClick={toggle}
        >
          Cancel
        </Button>
        {!hasError && (
          <Button
            variant="primary"
            size="medium"
            avoidFullWidth
            ref={focusRef}
            onClick={handleResend}
            disabled={isResending}
            isLoading={isResending}
          >
            Resend Email
          </Button>
        )}
      </div>
    </Modal>
  );
};
