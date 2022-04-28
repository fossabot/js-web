import { Dialog } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { CourseSessionToBook } from '../hooks/useBookSession';
import { useResponsive } from '../hooks/useResponsive';
import useTranslation from '../i18n/useTranslation';
import { ICourseOutline } from '../models/course';
import { Language } from '../models/language';
import Button from '../ui-kit/Button';
import { Modal } from '../ui-kit/HeadlessModal';
import { Close } from '../ui-kit/icons';
import CourseSessionBookingCard from './CourseSessionBookingCard';

interface IReviewBookingModalProps {
  isOpen: boolean;
  toggle: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  outline: ICourseOutline<Language>;
  session: CourseSessionToBook | null;
}

export const ReviewBookingModal = ({
  isOpen,
  onConfirm,
  onCancel,
  session,
  outline,
  toggle,
}: IReviewBookingModalProps) => {
  const { lg } = useResponsive();
  const { t } = useTranslation();

  const [modalSession, setModalSession] = useState(session);

  useEffect(() => {
    if (!session) {
      // ensure modal transition ends before removing state
      setTimeout(() => {
        setModalSession(null);
      }, 200);
    } else {
      setModalSession(session);
    }
  }, [session]);

  return (
    <Modal isOpen={isOpen} toggle={toggle} className="p-8">
      <Dialog.Title
        as="div"
        className="mb-4 flex justify-center lg:mb-6 lg:justify-between"
      >
        <span className="text-subheading font-semibold text-gray-900">
          {t('courseSessionsPage.reviewBooking')}
        </span>
        {lg && (
          <Close
            className="h-6 w-6 cursor-pointer text-gray-650 hover:text-gray-600"
            onClick={onCancel}
          />
        )}
      </Dialog.Title>
      <CourseSessionBookingCard outline={outline} session={modalSession} />

      <div className="mt-4 flex flex-row-reverse flex-wrap lg:mt-10">
        <Button
          avoidFullWidth={lg}
          className="ml-0 mb-3 font-semibold lg:ml-4 lg:mb-0"
          size="medium"
          variant="primary"
          type="button"
          onClick={onConfirm}
        >
          {t('courseSessionsPage.confirmBooking')}
        </Button>
        <Button
          avoidFullWidth={lg}
          className="font-semibold"
          size="medium"
          variant="secondary"
          type="button"
          onClick={onCancel}
        >
          {t('courseSessionsPage.cancel')}
        </Button>
      </div>
    </Modal>
  );
};
