import Link from 'next/link';
import { Dialog } from '@headlessui/react';
import { Dispatch, FC, useMemo, useRef } from 'react';
import useTranslation from '../../i18n/useTranslation';
import { UserEnrolledLearningTrackRaw } from '../../models/learningTrack';
import Button from '../../ui-kit/Button';
import { Modal } from '../../ui-kit/HeadlessModal';
import Picture from '../../ui-kit/Picture';
import WEB_PATHS from '../../constants/webPaths';
import CourseProgressRing from '../../course-detail/CourseProgressRing';

export interface IConfirmArchiveLearningTrackModal {
  learningTrack: UserEnrolledLearningTrackRaw;
  isOpen: boolean;
  toggle: Dispatch<boolean>;
  onOk: Dispatch<void>;
  loading?: boolean;
}

const ConfirmArchiveLearningTrackModal: FC<IConfirmArchiveLearningTrackModal> =
  (props) => {
    const { toggle, onOk, loading, learningTrack } = props;
    const initialFocusRef = useRef(null);
    const { t } = useTranslation();

    const learningTrackLink = useMemo(
      () => WEB_PATHS.COURSE_DETAIL.replace(':id', learningTrack?.id),
      [learningTrack?.id],
    );

    return (
      <Modal
        {...props}
        initialFocusRef={initialFocusRef}
        className="p-5 lg:w-max lg:p-8"
        skipOutsideClickEvent={loading}
      >
        <Dialog.Overlay />
        <Dialog.Title
          as="div"
          className="lg:inline-flex lg:items-center lg:space-x-5"
        >
          <div className="text-center text-subheading font-semibold">
            {t('dashboardLearningTrackListPage.archiveModal.title')}
          </div>
        </Dialog.Title>
        <div className="my-4 text-gray-650 lg:w-400px">
          {t('dashboardLearningTrackListPage.archiveModal.description')}
        </div>
        <div className="flex overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 p-4">
          <Link href={learningTrackLink}>
            <a className="block h-22 w-22 overflow-hidden rounded-2xl">
              {!learningTrack.imageKey ? (
                <Picture
                  className="h-full w-full object-cover object-center"
                  sources={[
                    {
                      srcSet: '/assets/course/course-default.webp',
                      type: 'image/webp',
                    },
                  ]}
                  fallbackImage={{
                    src: '/assets/course/course-default.png',
                  }}
                />
              ) : (
                <img
                  src={`${process.env.NEXT_PUBLIC_CDN_BASE_URL}/${learningTrack.imageKey}`}
                  className="h-full w-full object-cover object-center"
                />
              )}
            </a>
          </Link>
          <div className="ml-4 flex-1 text-caption font-semibold">
            <div className="mb-4 text-black line-clamp-2">
              {learningTrack.title}
            </div>
            <div className="flex items-center">
              <CourseProgressRing
                ringClassName="mr-1 w-5 h-5"
                overallCourseProgress={learningTrack.averagePercentage}
              />
            </div>
          </div>
        </div>
        <div className="mt-4 space-y-4 lg:mt-8 lg:flex lg:flex-row-reverse lg:space-y-0">
          <div className="max-w-25">
            <Button
              ref={initialFocusRef}
              size="medium"
              variant="primary"
              className="font-semibold"
              onClick={() => onOk()}
              disabled={loading}
            >
              {t(
                'dashboardLearningTrackListPage.archiveModal.archiveThisLearningTrack',
              )}
            </Button>
          </div>
          <div className="max-w-25 lg:mr-4">
            <Button
              size="medium"
              variant="secondary"
              className="font-semibold"
              onClick={() => toggle(false)}
              disabled={loading}
              isLoading={loading}
            >
              {t('dashboardLearningTrackListPage.archiveModal.cancel')}
            </Button>
          </div>
        </div>
      </Modal>
    );
  };

export default ConfirmArchiveLearningTrackModal;
