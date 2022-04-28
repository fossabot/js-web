import { MutableRefObject } from 'react';

import Breadcrumb from './Breadcrumb';
import Button from '../ui-kit/Button';
import Picture from '../ui-kit/Picture';
import useTranslation from '../i18n/useTranslation';
import LearningTrackMainCTA from './LearningTrackMainCTA';
import { getOverallLearningTrackProgress } from './helper';
import { IEnrolledStatus } from './LearningTrackDetailPage';
import { ILearningTrackDetail } from '../models/learningTrack';
import CourseProgressIndicator from '../course-detail/CourseProgressRing';
import { LearningTrackAssignmentStatus } from '../dashboard/components/LearningTrackAssignmentStatus';

export default function LearningTrackDetailHeader({
  learningTrackDetail,
  enrolledStatus,
  onEnroll,
  outlineRef,
}: {
  learningTrackDetail: ILearningTrackDetail;
  enrolledStatus: IEnrolledStatus;
  onEnroll: () => Promise<void>;
  outlineRef: MutableRefObject<any>;
}) {
  const { t } = useTranslation();

  const overallLearningTrackProgress = getOverallLearningTrackProgress(
    learningTrackDetail.learningTrackSections,
  );

  return (
    <div className="mx-6 flex flex-col border-b border-gray-200 pb-8 lg:mx-0 lg:flex-row lg:border-none lg:pb-0">
      <div className="relative mr-4 mb-6 h-248px w-248px flex-none lg:mb-0 lg:block lg:h-55 lg:w-55">
        {!learningTrackDetail.imageKey ? (
          <Picture
            className="rounded-2xl object-cover"
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
            className="rounded-2xl object-cover"
            alt={learningTrackDetail.title}
            src={`${process.env.NEXT_PUBLIC_CDN_BASE_URL}/${learningTrackDetail.imageKey}`}
          />
        )}
      </div>
      <div className="ml-0 flex h-full w-full flex-col justify-between lg:ml-4 lg:h-55">
        <div className="pb-6 lg:pb-4">
          <div className="mb-3 flex items-center space-x-2">
            <Breadcrumb learningTrackDetail={learningTrackDetail} />
            {learningTrackDetail.userAssignedLearningTrack?.[0] && (
              <LearningTrackAssignmentStatus
                type={
                  learningTrackDetail.userAssignedLearningTrack?.[0]
                    ?.assignmentType
                }
              />
            )}
          </div>

          <h2 className="text-subtitle font-bold line-clamp-none lg:line-clamp-2">
            {learningTrackDetail.title}
          </h2>
          {learningTrackDetail.tagLine ? (
            <div className="mt-2 text-body text-gray-650 line-clamp-none lg:line-clamp-2">
              {learningTrackDetail.tagLine}
            </div>
          ) : null}
        </div>
        <div className="mt-0 lg:mt-3.5">
          {enrolledStatus?.success ? (
            <div className="hidden w-full rounded-2xl border border-gray-200 bg-gray-100 p-2 lg:flex">
              <div className="ml-2 flex w-1/3 items-center text-body font-semibold">
                <CourseProgressIndicator
                  ringClassName="mr-2 w-6 h-6"
                  overallCourseProgress={overallLearningTrackProgress}
                />
              </div>
              {overallLearningTrackProgress >= 100 ? null : (
                <div className="flex w-2/3 items-center justify-end">
                  {true && (
                    <div className="text-right text-caption font-normal text-gray-500 line-clamp-1">
                      {'01 Some text'}
                    </div>
                  )}
                  <div className="ml-4">
                    <LearningTrackMainCTA
                      avoidFullWidth
                      outlineRef={outlineRef}
                      overallLearningTrackProgress={
                        overallLearningTrackProgress
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Button
              avoidFullWidth
              className="font-semibold"
              size="medium"
              variant="primary"
              type="button"
              onClick={onEnroll}
            >
              {t('learningTrackDetailPage.enrollNow')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
