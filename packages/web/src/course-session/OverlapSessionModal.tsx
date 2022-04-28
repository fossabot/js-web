import { Dialog } from '@headlessui/react';
import { FC, useRef } from 'react';
import { useResponsive } from '../hooks/useResponsive';
import { useLocaleText } from '../i18n/useLocaleText';
import useTranslation from '../i18n/useTranslation';
import Button from '../ui-kit/Button';
import { Modal } from '../ui-kit/HeadlessModal';
import { ArrowRight, Close } from '../ui-kit/icons';
import Picture from '../ui-kit/Picture';

interface IOverlapSessionModal {
  isOpen: boolean;
  toggle: () => void;
  onOk?: () => void;
  modalData: any;
}

export const OverlapSessionModal: FC<IOverlapSessionModal> = (props) => {
  const { isOpen, toggle, onOk, modalData } = props;
  const { lg } = useResponsive();
  const { t } = useTranslation();
  const localeText = useLocaleText();

  const initialFocusRef = useRef(null);

  const courseOutline = modalData?.overlapSession?.courseSession?.courseOutline;

  const course = courseOutline?.course;

  if (!modalData || !courseOutline || !course) return null;

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      className="p-6"
      initialFocusRef={initialFocusRef}
    >
      <Dialog.Title as="div" className="">
        <div className="mb-4 flex justify-between">
          <h6 className="text-subheading font-semibold">
            {t('overlapSessionModal.title')}
          </h6>
          {lg && (
            <Close
              className="h-6 w-6 cursor-pointer text-gray-650 hover:text-gray-600"
              onClick={toggle}
            />
          )}
        </div>
        <p className="text-gray-650">
          {t('overlapSessionModal.preDescription')}{' '}
          <span className="font-semibold text-brand-primary">
            {t('overlapSessionModal.timedOverlap')}
          </span>{' '}
          {t('overlapSessionModal.postDescription')}
        </p>
      </Dialog.Title>
      <div className="mt-4 flex items-center space-x-4 rounded-3xl border border-gray-200 bg-gray-100 p-4">
        {!course.imageKey ? (
          <Picture
            className="h-22 w-22 rounded-2xl object-cover"
            sources={[
              {
                srcSet: '/assets/course/course-default.webp',
                type: 'image/webp',
              },
            ]}
            fallbackImage={{ src: '/assets/course/course-default.png' }}
          />
        ) : (
          <img
            className="h-22 w-22 rounded-2xl object-cover"
            alt={course.title}
            src={`${process.env.NEXT_PUBLIC_CDN_BASE_URL}/${course.imageKey}`}
          />
        )}

        <div>
          <p className="text-caption font-semibold">
            {localeText(course?.title)}
          </p>
          <p className="text-caption text-gray-650">
            {localeText(courseOutline?.title)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-row-reverse flex-wrap lg:mt-10">
        <Button
          ref={initialFocusRef}
          avoidFullWidth={lg}
          className="ml-0 mb-3 font-semibold lg:ml-4 lg:mb-0"
          size="medium"
          variant="primary"
          type="button"
          onClick={() => {
            toggle();
            onOk?.();
          }}
        >
          <span>{t('overlapSessionModal.removeAndContinue')}</span>
          <ArrowRight className="ml-2" />
        </Button>
        <Button
          avoidFullWidth={lg}
          className="font-semibold"
          size="medium"
          variant="secondary"
          type="button"
          onClick={() => {
            toggle();
          }}
        >
          {t('overlapSessionModal.cancel')}
        </Button>
      </div>
    </Modal>
  );
};
