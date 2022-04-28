import cx from 'classnames';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import WEB_PATHS from '../../constants/webPaths';
import CourseProgressIndicator from '../../course-detail/CourseProgressRing';
import { getDurationText } from '../../course-detail/getDurationText';
import useTranslation from '../../i18n/useTranslation';
import { CourseCategoryKey, UserEnrolledCourseRaw } from '../../models/course';
import {
  ArrowRight,
  Certificate,
  ClockGray,
  DocumentGray,
  DotsHorizontal,
  FaceToFaceGray,
  LessonGray,
  OnlineLearningVideo,
  SoundUpGray,
} from '../../ui-kit/icons';
import Picture from '../../ui-kit/Picture';
import { CourseAssignmentStatus } from './CourseAssignmentStatus';
import { UserCourseCardSkeleton } from './UserCourseCardSkeleton';

interface ICourseItem {
  course: UserEnrolledCourseRaw;
  onToggleArchive: (course: UserEnrolledCourseRaw) => void;
}

function CourseItem({ course, onToggleArchive }: ICourseItem) {
  const { t } = useTranslation();
  const [showSubMenu, setShowSubMenu] = useState(false);

  const courseLink = useMemo(
    () => WEB_PATHS.COURSE_DETAIL.replace(':id', course?.id),
    [course?.id],
  );

  const overallPercentage = useMemo(() => {
    const percent = course?.averagePercentage;
    return percent >= 100 ? 100 : percent;
  }, [course?.averagePercentage]);

  function archiveCourse(course: UserEnrolledCourseRaw) {
    onToggleArchive(course);
  }

  function onMouseOverDots(e) {
    e.preventDefault();
    setTimeout(() => {
      setShowSubMenu(true);
    }, 100);
  }

  const ctaButton = useMemo(() => {
    // only redirect to course outline sessions page if learning event is still not completed
    const url =
      course?.categoryKey === CourseCategoryKey.LEARNING_EVENT &&
      course?.averagePercentage < 100
        ? WEB_PATHS.COURSE_OUTLINE_SESSIONS.replace(
            ':id',
            course?.firstCourseOutlineId,
          )
        : WEB_PATHS.COURSE_DETAIL.replace(':id', course?.id);
    return (
      <Link href={url}>
        <a
          className={cx('flex items-center text-caption font-semibold', {
            'text-gray-650': course?.averagePercentage >= 100,
            'text-brand-primary': course?.averagePercentage < 100,
          })}
        >
          {course?.averagePercentage >= 100 && (
            <span>{t('dashboardCourseListPage.viewCourse')}</span>
          )}
          {course?.averagePercentage > 0 && course?.averagePercentage < 100 && (
            <span>{t('dashboardCourseListPage.continue')}</span>
          )}
          {course?.averagePercentage <= 0 &&
            course.categoryKey !== CourseCategoryKey.LEARNING_EVENT && (
              <span>{t('dashboardCourseListPage.begin')}</span>
            )}
          {course?.averagePercentage <= 0 &&
            course.categoryKey === CourseCategoryKey.LEARNING_EVENT && (
              <span>{t('dashboardCourseListPage.bookNow')}</span>
            )}
          <ArrowRight className="ml-1.5" />
        </a>
      </Link>
    );
  }, [course?.id, course?.averagePercentage]);

  const courseLanguage = useMemo(() => {
    const langUpperCase = course?.availableLanguage.toLocaleUpperCase();
    return (
      <div className="flex items-center">
        <SoundUpGray className="mr-1.5 h-4 w-4" />
        <span className="text-caption font-semibold text-gray-650">
          {langUpperCase === 'ALL' ? 'EN / TH' : langUpperCase}
        </span>
      </div>
    );
  }, [course?.availableLanguage]);

  return (
    <div className="relative w-full bg-gray-100 lg:flex lg:w-181 lg:space-x-4 lg:overflow-hidden lg:rounded-3xl lg:border lg:border-gray-200 lg:p-4">
      <Link href={courseLink}>
        <a className="block overflow-hidden rounded-t-2xl lg:h-36 lg:w-36 lg:rounded-2xl">
          {!course?.imageKey ? (
            <Picture
              className="h-full w-full object-cover object-center"
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
              src={`${process.env.NEXT_PUBLIC_CDN_BASE_URL}/${course?.imageKey}`}
              className="h-full w-full object-cover object-center"
            />
          )}
        </a>
      </Link>

      <div className="absolute -bottom-14 left-0 flex w-full flex-1 flex-col rounded-b-2xl border border-gray-200 bg-gray-100 p-6 pb-5 lg:static lg:w-auto lg:rounded-none lg:border-none lg:p-0">
        <div className="flex-1">
          <Link href={courseLink}>
            <a className="mb-2 block text-body font-semibold text-black">
              {course?.title}
            </a>
          </Link>
          {!!course?.tagLine && (
            <div
              title={course?.tagLine}
              className="text-caption text-gray-650 line-clamp-2 lg:line-clamp-1"
            >
              {course?.tagLine}
            </div>
          )}
        </div>
        <div className="mt-4 flex w-full flex-wrap gap-2 text-gray-650">
          {course?.categoryKey === CourseCategoryKey.LEARNING_EVENT && (
            <>
              <div className="flex items-center text-caption font-semibold">
                <FaceToFaceGray className="mr-2 h-4 w-4" />
                {t('dashboardCourseListPage.virtualAndFaceToFace')}
              </div>
              <div className="w-0 border-r border-gray-400" />
              <div className="flex items-center text-caption font-semibold">
                <LessonGray className="mr-2 h-4 w-4" />
                {t('dashboardCourseListPage.lessons', {
                  number: course?.lessonLength,
                })}
              </div>
            </>
          )}
          {course?.categoryKey === CourseCategoryKey.MATERIAL && (
            <>
              <div className="flex items-center text-caption font-semibold">
                <DocumentGray className="mr-2 h-4 w-4" />
                {t('dashboardCourseListPage.document')}
              </div>
              <div className="w-0 border-r border-gray-400" />
              <div className="flex items-center text-caption font-semibold">
                <LessonGray className="mr-2 h-4 w-4" />
                {t('dashboardCourseListPage.lessons', {
                  number: course?.lessonLength,
                })}
              </div>
            </>
          )}
          {course?.categoryKey === CourseCategoryKey.ONLINE_LEARNING && (
            <>
              <div className="flex items-center text-caption font-semibold">
                <OnlineLearningVideo className="mr-2 h-4 w-4" />
                {t('dashboardCourseListPage.onlineCourse')}
              </div>
              <div className="w-0 border-r border-gray-400" />
              <div className="flex items-center text-caption font-semibold">
                <ClockGray className="mr-2 h-4 w-4" />
                <span>{getDurationText(course, t)}</span>
              </div>
              <div className="w-0 border-r border-gray-400" />
              {courseLanguage}
            </>
          )}
          {course?.hasCertificate && (
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
              <CourseProgressIndicator
                ringClassName="mr-1 w-5 h-5"
                overallCourseProgress={overallPercentage}
              />
            </div>
            {course.userAssignedCourseType && (
              <CourseAssignmentStatus type={course.userAssignedCourseType} />
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
          onClick={() => archiveCourse(course)}
          onMouseOut={() => setShowSubMenu(false)}
        >
          {course?.isArchived
            ? t('dashboardCourseListPage.unarchiveThisCourse')
            : t('dashboardCourseListPage.archiveThisCourse')}
        </div>
      )}
    </div>
  );
}

interface ICourseList {
  courses: UserEnrolledCourseRaw[];
  onToggleArchive: (course: UserEnrolledCourseRaw) => void;
  loading: 'initial' | 'more' | null;
}

function CourseList({ courses, onToggleArchive, loading }: ICourseList) {
  const { t } = useTranslation();

  if (loading === 'initial' && courses.length === 0)
    return (
      <div className="mb-14 flex flex-1 flex-col gap-y-20 p-6 lg:mb-0 lg:gap-y-4">
        <UserCourseCardSkeleton withFooter={false} withHeader={false} />
        <UserCourseCardSkeleton withFooter={false} withHeader={false} />
      </div>
    );
  else if (!courses?.length && loading === null) {
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
          {t('dashboardCourseListPage.noCourseFound')}
        </h4>
      </div>
    );
  } else {
    return (
      <div className="mb-14 flex flex-1 flex-col gap-y-20 p-6 lg:mb-0 lg:gap-y-4">
        {courses?.length &&
          courses.map((course, index) => (
            <CourseItem
              key={index}
              course={course}
              onToggleArchive={onToggleArchive}
            />
          ))}

        {loading === 'more' && (
          <div className="loader h-5 w-5 animate-spin self-center rounded-full border-4 border-gray-500" />
        )}
      </div>
    );
  }
}

export default CourseList;
