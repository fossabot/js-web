import { useEffect } from 'react';
import { Dialog } from '@headlessui/react';

import Button from '../ui-kit/Button';
import Picture from '../ui-kit/Picture';
import WEB_PATHS from '../constants/webPaths';
import { ICourseDetail } from '../models/course';
import { ArrowRight, Close } from '../ui-kit/icons';
import useTranslation from '../i18n/useTranslation';
import { Modal, useModal } from '../ui-kit/HeadlessModal';
import Link from 'next/link';

export default function PreRequisiteCourseModal({
  course,
  showPreRequisiteModal,
  setShowPreRequisiteModal,
}: {
  course: ICourseDetail<string>;
  showPreRequisiteModal: boolean;
  setShowPreRequisiteModal: (arg: boolean) => void;
}) {
  const { t } = useTranslation();
  const { toggle, isOpen } = useModal();

  useEffect(() => {
    toggle(showPreRequisiteModal);
  }, [showPreRequisiteModal]);

  if (!course) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      skipFullWidth
      className="w-344px p-5 lg:w-472px lg:p-8"
      onClose={() => setShowPreRequisiteModal(false)}
    >
      <Dialog.Title as="div" className="flex justify-between">
        <span className="text-subheading font-semibold text-gray-900">
          {t('courseDetailPage.preRequisiteCourseModal.completeCourseToEnroll')}
        </span>
        <Close
          className="h-6 w-6 cursor-pointer text-gray-650 hover:text-gray-600"
          onClick={() => {
            toggle(false);
            setShowPreRequisiteModal(false);
          }}
        />
      </Dialog.Title>
      <div className="mt-4 mb-4 lg:mb-6">
        {t('courseDetailPage.preRequisiteCourseModal.suggestionText')}
      </div>
      <div className="mb-4 flex items-center rounded-2xl border border-gray-200 bg-gray-100 p-4 lg:mb-8">
        <div className="relative mr-4 h-22 w-22 flex-none">
          {!course.imageKey ? (
            <Picture
              className="rounded-xxl object-cover"
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
              className="rounded-xxl object-cover"
              alt={course.title}
              src={`${process.env.NEXT_PUBLIC_CDN_BASE_URL}/${course.imageKey}`}
            />
          )}
        </div>
        <div className="text-caption font-semibold line-clamp-3">
          {course.title}
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
            toggle(false);
            setShowPreRequisiteModal(false);
          }}
        >
          {t('courseDetailPage.preRequisiteCourseModal.stayOnPage')}
        </Button>
        <Link href={WEB_PATHS.COURSE_DETAIL.replace(':id', course.id)} passHref>
          <a tabIndex={-1}>
            <Button
              avoidFullWidth
              className="mb-2 w-full font-semibold lg:ml-2 lg:mb-0"
              size="medium"
              variant="primary"
              type="button"
              iconRight={
                <ArrowRight className="ml-1 h-5 w-5 font-semibold text-white" />
              }
            >
              {t('courseDetailPage.preRequisiteCourseModal.takeMeThere')}
            </Button>
          </a>
        </Link>
      </div>
    </Modal>
  );
}
