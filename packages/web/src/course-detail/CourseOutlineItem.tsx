import cx from 'classnames';
import { useRouter } from 'next/router';
import pluralize from 'pluralize';
import React, { useMemo } from 'react';
import WEB_PATHS from '../constants/webPaths';
import useTranslation from '../i18n/useTranslation';
import {
  CourseCategoryKey,
  CourseSubCategoryKey,
  ICourseDetail,
  ICourseOutlineDetail,
} from '../models/course';
import { ContentLineClamp } from '../ui-kit/ContentLineClamp/ContentLineClamp';
import {
  ArrowRepeat,
  ArrowRight,
  CalendarCheck,
  ClockGray,
  Close,
  DoorOpen,
  Refresh,
} from '../ui-kit/icons';
import { ProfilePic } from '../ui-kit/ProfilePic';
import {
  IEnrolledStatus,
  ValidateCourseOutlineParams,
} from './CourseDetailPage';
import { getDurationText } from './getDurationText';

export default function CourseOutlineItem({
  index,
  outline,
  courseDetail,
  enrolledStatus,
  onValidate,
}: {
  index: number;
  outline: ICourseOutlineDetail;
  courseDetail: ICourseDetail;
  enrolledStatus: IEnrolledStatus;
  onValidate: (params: ValidateCourseOutlineParams) => Promise<boolean>;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const isEnrolled = !!enrolledStatus?.success;
  const courseOutlineFirstCategoryKey =
    courseDetail.courseOutlines[0].category.key;
  let outlineProgressPercentage =
    outline?.userCourseOutlineProgress[0]?.percentage || 0;

  if (outlineProgressPercentage > 100) outlineProgressPercentage = 100;

  const handleClick = async () => {
    const allowed = await onValidate({
      type: 'VALIDATE_OUTLINE',
      outlineId: outline.id,
    });

    if (!allowed) return;

    if (courseOutlineFirstCategoryKey === CourseSubCategoryKey.SCORM)
      router.push({
        pathname: WEB_PATHS.SCORM_PLAYER.replace(
          ':id',
          outline.learningContentFile.id,
        ),
        query: { courseId: courseDetail.id, courseOutlineId: outline.id },
      });

    if (courseDetail.category.key === CourseCategoryKey.LEARNING_EVENT) {
      router.push(WEB_PATHS.COURSE_OUTLINE_SESSIONS.replace(':id', outline.id));
    }
  };

  const upcomingBookingInfo = useMemo(
    () => (
      <>
        {outline.totalSessionsBooked > 0 && (
          <div className="flex flex-row">
            <div className="mx-2 h-4 w-1px bg-gray-200" />
            <CalendarCheck className="mr-1 h-5 w-5" />
            <p className="text-caption font-semibold">
              <span className="hidden lg:inline-block">
                {pluralize(
                  t('courseDetailPage.upcomingBooking', {
                    number: outline.totalSessionsBooked,
                  }),
                  outline.totalSessionsBooked,
                )}
              </span>
              <span className="inline-block lg:hidden">
                {outline.totalSessionsBooked}
              </span>
            </p>
          </div>
        )}
      </>
    ),
    [outline.totalSessionsBooked, t],
  );

  return (
    <div className="mb-4 flex w-full justify-between rounded-2xl border border-gray-200 px-4 pt-3 pb-4 hover:shadow">
      <div className="flex w-full flex-row">
        <div
          className={cx(
            'flex h-15 w-15 flex-none items-center justify-center rounded-full border-2',
            {
              'border-gray-300': outlineProgressPercentage === 0,
              'border-yellow-200':
                outlineProgressPercentage > 0 &&
                outlineProgressPercentage < 100,
              'border-green-200': outlineProgressPercentage === 100,
            },
          )}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200">
            <p className="text-body font-bold">
              {(index + 1).toLocaleString(undefined, {
                minimumIntegerDigits: 2,
              })}
            </p>
          </div>
        </div>
        <div className="mt-2 ml-4 w-full">
          <div className="mb-2.5 flex justify-between">
            <div>
              <p className="mr-2 text-body font-semibold">{outline.title}</p>
              <div className="mt-2 flex items-center">
                <ClockGray className="mr-1 inline h-5 w-5" />
                <span className="text-caption text-gray-500">
                  {getDurationText(outline, t)}
                </span>
              </div>
            </div>
            <div className="hidden lg:flex lg:space-x-1">
              {outline.instructors.slice(0, 5).map((instructor) => (
                <ProfilePic
                  key={instructor.id}
                  className="h-8 w-8 text-gray-300"
                  imageKey={instructor.profileImageKey}
                />
              ))}
            </div>
          </div>
          {outline.description && (
            <div className="mb-4">
              <ContentLineClamp
                allowLines={3}
                content={outline.description}
                collapsable={true}
                lineHeight={21}
              />
            </div>
          )}
          {isEnrolled && (
            <div className="mb-1 flex items-center justify-between border-t border-gray-200 pt-3.5">
              {courseDetail.category.key !==
                CourseCategoryKey.LEARNING_EVENT && (
                <>
                  <div
                    className={cx('rounded-2xl py-0.5 px-3 text-caption', {
                      'bg-gray-200 text-gray-500':
                        outlineProgressPercentage === 0,
                      'bg-yellow-100 text-yellow-400':
                        outlineProgressPercentage > 0 &&
                        outlineProgressPercentage < 100,
                      'bg-green-100 text-green-300':
                        outlineProgressPercentage === 100,
                    })}
                  >
                    {outlineProgressPercentage === 0 &&
                      t('courseDetailPage.notStarted')}
                    {outlineProgressPercentage > 0 &&
                      outlineProgressPercentage < 100 &&
                      t('courseDetailPage.inProgress')}
                    {outlineProgressPercentage === 100 &&
                      t('courseDetailPage.completed')}
                  </div>
                  <a
                    onClick={() => handleClick()}
                    className="flex cursor-pointer items-center text-caption font-semibold text-brand-primary"
                  >
                    {outlineProgressPercentage === 0 && (
                      <>
                        <span>{t('courseDetailPage.begin')}</span>
                        <ArrowRight className="ml-1 inline h-4 w-4" />
                      </>
                    )}
                    {outlineProgressPercentage > 0 &&
                      outlineProgressPercentage < 100 && (
                        <>
                          <span>{t('courseDetailPage.continue')}</span>
                          <ArrowRight className="ml-1 inline h-4 w-4" />
                        </>
                      )}
                    {outlineProgressPercentage === 100 && (
                      <>
                        <span>{t('courseDetailPage.startOver')}</span>
                        <Refresh className="ml-1 inline h-4 w-4" />
                      </>
                    )}
                  </a>
                </>
              )}

              {courseDetail.category.key === CourseCategoryKey.LEARNING_EVENT &&
                outline.availableSessionCount <= 0 && (
                  <div className="flex space-x-1 text-caption font-semibold text-gray-400">
                    <Close />
                    <span>{t('courseDetailPage.noOpenSession')}</span>

                    <span className="text-gray-650">{upcomingBookingInfo}</span>
                  </div>
                )}
              {courseDetail.category.key === CourseCategoryKey.LEARNING_EVENT &&
                outline.availableSessionCount > 0 && (
                  <>
                    <div className="flex space-x-1 text-caption font-semibold text-gray-650">
                      <DoorOpen keepColor />
                      <span>
                        {outline.availableSessionCount}{' '}
                        <span className="hidden lg:inline">
                          {pluralize(
                            t('courseDetailPage.openSession'),
                            outline.availableSessionCount,
                          )}
                        </span>
                      </span>

                      {upcomingBookingInfo}
                    </div>

                    {outline.totalSessionsBooked > 0 ? (
                      <a
                        role="button"
                        onClick={handleClick}
                        className="flex cursor-pointer items-center space-x-1 text-caption font-semibold text-brand-primary"
                      >
                        <span>{t('courseDetailPage.bookAgain')}</span>
                        <ArrowRepeat />
                      </a>
                    ) : (
                      <a
                        role="button"
                        className="flex cursor-pointer items-center space-x-1 text-caption font-semibold text-brand-primary"
                        onClick={handleClick}
                      >
                        <span>{t('courseDetailPage.bookNow')}</span>
                        <ArrowRight />
                      </a>
                    )}
                  </>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
