import cx from 'classnames';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import WEB_PATHS from '../../constants/webPaths';
import CourseProgressRing from '../../course-detail/CourseProgressRing';
import { getDurationText } from '../../course-detail/getDurationText';
import useTranslation from '../../i18n/useTranslation';
import { UserEnrolledLearningTrackRaw } from '../../models/learningTrack';
import {
  ArrowRight,
  Certificate,
  ClockGray,
  DotsHorizontal,
} from '../../ui-kit/icons';
import Picture from '../../ui-kit/Picture';
import { LearningTrackAssignmentStatus } from './LearningTrackAssignmentStatus';

interface ILearningTrackItem {
  learningTrack: UserEnrolledLearningTrackRaw;
  onToggleArchive: (learningTrack: UserEnrolledLearningTrackRaw) => void;
}

function LearningTrackItem({
  learningTrack,
  onToggleArchive,
}: ILearningTrackItem) {
  const { t } = useTranslation();
  const [showSubMenu, setShowSubMenu] = useState(false);

  const learningTrackLink = useMemo(
    () => WEB_PATHS.LEARNING_TRACK_DETAIL.replace(':id', learningTrack?.id),
    [learningTrack?.id],
  );

  const overallPercentage = useMemo(() => {
    const percent = learningTrack?.averagePercentage;
    return percent >= 100 ? 100 : percent;
  }, [learningTrack?.averagePercentage]);

  function archiveLearningTrack(learningTrack: UserEnrolledLearningTrackRaw) {
    onToggleArchive(learningTrack);
  }

  function onMouseOverDots(e) {
    e.preventDefault();
    setTimeout(() => {
      setShowSubMenu(true);
    }, 100);
  }

  const ctaButton = useMemo(() => {
    return (
      <Link href={learningTrackLink}>
        <a
          className={cx('flex items-center text-caption font-semibold', {
            'text-gray-650': learningTrack?.averagePercentage >= 100,
            'text-brand-primary': learningTrack?.averagePercentage < 100,
          })}
        >
          {learningTrack?.averagePercentage >= 100 && (
            <span>{t('dashboardLearningTrackListPage.viewLearningTrack')}</span>
          )}
          {learningTrack?.averagePercentage > 0 &&
            learningTrack?.averagePercentage < 100 && (
              <span>{t('dashboardLearningTrackListPage.continue')}</span>
            )}
          {learningTrack?.averagePercentage <= 0 && (
            <span>{t('dashboardLearningTrackListPage.begin')}</span>
          )}
          <ArrowRight className="ml-1.5" />
        </a>
      </Link>
    );
  }, [learningTrackLink, learningTrack?.averagePercentage]);

  return (
    <div className="relative w-full bg-gray-100 lg:flex lg:w-181 lg:space-x-4 lg:overflow-hidden lg:rounded-3xl lg:border lg:border-gray-200 lg:p-4">
      <Link href={learningTrackLink}>
        <a className="block overflow-hidden rounded-t-2xl lg:h-36 lg:w-36 lg:rounded-2xl">
          {!learningTrack?.imageKey ? (
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
              src={`${process.env.NEXT_PUBLIC_CDN_BASE_URL}/${learningTrack?.imageKey}`}
              className="h-full w-full object-cover object-center"
            />
          )}
        </a>
      </Link>

      <div className="absolute -bottom-14 left-0 flex w-full flex-1 flex-col rounded-b-2xl border border-gray-200 bg-gray-100 p-6 pb-5 lg:static lg:w-auto lg:rounded-none lg:border-none lg:p-0">
        <div className="flex-1">
          <Link href={learningTrackLink}>
            <a className="mb-2 block text-body font-semibold text-black">
              {learningTrack?.title}
            </a>
          </Link>
          {!!learningTrack?.tagLine && (
            <div
              title={learningTrack?.tagLine}
              className="text-caption text-gray-650 line-clamp-2 lg:line-clamp-1"
            >
              {learningTrack?.tagLine}
            </div>
          )}
        </div>
        <div className="mt-4 flex w-full flex-wrap gap-2 text-gray-650">
          <div className="flex items-center text-caption font-semibold">
            <ClockGray className="mr-2 h-4 w-4" />
            <span>{getDurationText(learningTrack, t)}</span>
          </div>
          {learningTrack?.hasCertificate && (
            <>
              <div className="w-0 border-l border-gray-400" />
              <div className="flex items-center text-caption font-semibold">
                <Certificate className="mr-2 h-4 w-4" />
                {t('dashboardCourseListPage.certificate')}
              </div>
            </>
          )}
        </div>
        <div className="mt-3 flex w-full flex-wrap items-center justify-between border-t border-gray-200 pt-4 font-semibold">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-caption">
              <CourseProgressRing
                ringClassName="mr-1 w-5 h-5"
                overallCourseProgress={overallPercentage}
              />
            </div>
            {learningTrack.userAssignedLearningTrackType && (
              <LearningTrackAssignmentStatus
                type={learningTrack.userAssignedLearningTrackType}
              />
            )}
          </div>
          {ctaButton}
        </div>
      </div>

      {!showSubMenu && (
        <div
          className="absolute top-4 right-4 cursor-pointer text-black"
          onMouseOver={onMouseOverDots}
        >
          <DotsHorizontal className="h-6 w-6" />
        </div>
      )}
      {showSubMenu && (
        <div
          className="absolute top-4 right-4 cursor-pointer overflow-hidden rounded-lg bg-white px-6 py-5 text-body font-semibold text-black shadow"
          onClick={() => archiveLearningTrack(learningTrack)}
          onMouseOut={() => setShowSubMenu(false)}
        >
          {learningTrack?.isArchived
            ? t('dashboardLearningTrackListPage.unarchiveThisLearningTrack')
            : t('dashboardLearningTrackListPage.archiveThisLearningTrack')}
        </div>
      )}
    </div>
  );
}

interface ILearningTrackList {
  learningTracks: UserEnrolledLearningTrackRaw[];
  onToggleArchive: (learningTrack: UserEnrolledLearningTrackRaw) => void;
}

function LearningTrackList({
  learningTracks,
  onToggleArchive,
}: ILearningTrackList) {
  const { t } = useTranslation();

  if (!learningTracks?.length) {
    return (
      <div className="mt-8 flex w-full flex-col items-center lg:mt-24">
        <Picture
          sources={[
            {
              srcSet: '/assets/empty.webp',
              type: 'image/webp',
            },
          ]}
          fallbackImage={{
            src: '/assets/empty.png',
          }}
        />
        <h4 className="mt-8 text-heading font-semibold">
          {t('dashboardLearningTrackListPage.noLearningTrackFound')}
        </h4>
      </div>
    );
  } else {
    return (
      <div className="mb-14 flex flex-1 flex-col gap-y-20 p-6 lg:mb-0 lg:gap-y-4">
        {learningTracks?.length &&
          learningTracks.map((learningTrack) => (
            <LearningTrackItem
              key={learningTrack.id}
              learningTrack={learningTrack}
              onToggleArchive={onToggleArchive}
            />
          ))}
      </div>
    );
  }
}

export default LearningTrackList;
