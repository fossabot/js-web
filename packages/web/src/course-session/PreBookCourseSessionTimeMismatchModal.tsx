import { useRef } from 'react';
import { useRouter } from 'next/router';
import { Dialog } from '@headlessui/react';

import Button from '../ui-kit/Button';
import Picture from '../ui-kit/Picture';
import WEB_PATHS from '../constants/webPaths';
import { Language } from '../models/language';
import { Modal } from '../ui-kit/HeadlessModal';
import { ICourseOutline } from '../models/course';
import useTranslation from '../i18n/useTranslation';
import { ArrowRight, Close } from '../ui-kit/icons';
import { getLanguageValue } from '../i18n/lang-utils';

interface IPreBookCourseSessionTimeMismatchModal {
  isOpen: boolean;
  onClose: () => void;
  toggle: (arg?: boolean) => void;
  courseOutline: ICourseOutline<Language>;
}

export default function PreBookCourseSessionTimeMismatchModal({
  courseOutline,
  isOpen,
  toggle,
  onClose,
}: IPreBookCourseSessionTimeMismatchModal) {
  const router = useRouter();
  const buttonRef = useRef();
  const { t } = useTranslation();

  if (!courseOutline) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      skipFullWidth
      initialFocusRef={buttonRef}
      className="w-344px p-5 lg:w-472px lg:p-8"
    >
      <Dialog.Title as="div" className="flex justify-between">
        <span className="text-subheading font-semibold text-gray-900">
          {t('courseSessionsPage.preBookCourseSessionTimeMismatchModal.title')}
        </span>
        <Close
          className="h-6 w-6 cursor-pointer text-gray-650 hover:text-gray-600"
          onClick={() => {
            onClose();
            toggle(false);
          }}
        />
      </Dialog.Title>
      <div className="mt-4 mb-4 lg:mb-6">
        {t(
          'courseSessionsPage.preBookCourseSessionTimeMismatchModal.suggestionText',
        )}
      </div>
      <div className="mb-4 flex items-center rounded-2xl border border-gray-200 bg-gray-100 p-4 lg:mb-8">
        <div className="relative mr-4 h-22 w-22 flex-none">
          <Picture
            className="rounded-xxl object-cover"
            sources={[
              {
                srcSet: '/assets/booking/session/pre-booking-rule-trigger.webp',
                type: 'image/webp',
              },
            ]}
            fallbackImage={{
              src: '/assets/booking/session/pre-booking-rule-trigger.png',
            }}
          />
        </div>
        <div className="text-caption font-semibold line-clamp-3">
          {getLanguageValue(courseOutline.title)}
        </div>
      </div>
      <div className="flex flex-col-reverse justify-end lg:flex-row">
        <Button
          avoidFullWidth
          className="font-semibold lg:mr-2"
          size="medium"
          variant="secondary"
          type="button"
          onClick={() => {
            onClose();
            toggle(false);
          }}
        >
          {t(
            'courseSessionsPage.preBookCourseSessionTimeMismatchModal.selectAnotherTime',
          )}
        </Button>
        <Button
          avoidFullWidth
          ref={buttonRef}
          className="mb-3 font-semibold lg:ml-2 lg:mb-0"
          size="medium"
          variant="primary"
          type="button"
          onClick={() => {
            router.push(
              WEB_PATHS.COURSE_OUTLINE_SESSIONS.replace(
                ':id',
                courseOutline.id,
              ),
            );
            onClose();
            toggle(false);
          }}
          iconRight={
            <ArrowRight className="ml-1 h-5 w-5 font-semibold text-white" />
          }
        >
          {t(
            'courseSessionsPage.preBookCourseSessionTimeMismatchModal.takeMeThere',
          )}
        </Button>
      </div>
    </Modal>
  );
}
