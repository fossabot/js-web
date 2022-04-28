import cx from 'classnames';
import Link from 'next/link';

import Picture from '../ui-kit/Picture';
import { ArrowRight } from '../ui-kit/icons';
import WEB_PATHS from '../constants/webPaths';
import useTranslation from '../i18n/useTranslation';
import CourseCategoryBadge from './CourseCategoryBadge';
import { CourseSubCategoryKey } from '../models/course';
import CourseProgressIndicator from '../course-detail/CourseProgressRing';
import { ISectionCourse } from '../models/learningTrack';

const CourseHeaderActionCenter = ({
  courseDetail,
  overallCourseProgress,
  t,
  className,
}) => {
  return (
    <div className={cx('border-t border-gray-200 pt-4', className)}>
      <div className="flex w-full">
        <div className="flex w-2/3 items-center  text-caption font-semibold">
          <CourseProgressIndicator
            ringClassName="mr-2 w-5 h-5"
            overallCourseProgress={overallCourseProgress}
          />
          {courseDetail.isRequired && (
            <span className="ml-3 rounded-3xl border border-orange-300 px-3 text-sm font-semibold text-orange-300">
              {t('required')}
            </span>
          )}
        </div>
        <div className="-pr-5 flex w-1/3 items-center justify-end text-caption font-semibold">
          <Link href={WEB_PATHS.COURSE_DETAIL.replace(':id', courseDetail.id)}>
            <a
              className={cx('flex flex-row items-center', {
                'text-brand-primary': overallCourseProgress < 100,
                'text-gray-650': overallCourseProgress >= 100,
              })}
            >
              {overallCourseProgress <= 0 && (
                <span>{t('learningTrackDetailPage.begin')}</span>
              )}
              {overallCourseProgress > 0 && overallCourseProgress < 100 && (
                <span>{t('learningTrackDetailPage.begin')}</span>
              )}
              {overallCourseProgress >= 100 && (
                <span>{t('learningTrackDetailPage.viewCourse')}</span>
              )}
              <ArrowRight className="ml-1 h-4 w-4" />
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function SectionCourse({
  courseDetail,
}: {
  courseDetail: ISectionCourse;
}) {
  const { t } = useTranslation();

  const overallCourseProgress = courseDetail.userEnrolledCourse.length
    ? courseDetail.userEnrolledCourse[0].percentage
    : 0;

  return (
    <div className="flex w-full flex-col border-gray-200 bg-white p-4 lg:mt-4 lg:rounded-2xl lg:border">
      <div className="flex w-full flex-row border-b border-gray-200 pb-4 lg:border-0 lg:pb-0">
        <div className="relative mr-4 h-25.5 w-25.5 flex-none lg:block lg:h-28 lg:w-28">
          {!courseDetail.imageKey ? (
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
              alt={courseDetail.title}
              src={`${process.env.NEXT_PUBLIC_CDN_BASE_URL}/${courseDetail.imageKey}`}
            />
          )}
          <>
            {courseDetail.courseOutlines.find(
              (co) => co.category?.key === CourseSubCategoryKey.LINK,
            ) ? (
              <div className="absolute bottom-0 right-0 rounded-tl-lg rounded-br-xl bg-maroon-100 px-2 py-1 text-xs font-semibold text-brand-primary lg:px-4 lg:py-2">
                <div className="line-clamp-1">
                  {courseDetail.courseOutlines[0].providerName}
                </div>
              </div>
            ) : null}
          </>
        </div>
        <div className="flex h-full w-full flex-col justify-between lg:h-28">
          <div className="pb-0 lg:pb-4">
            <h2 className="text-body font-semibold line-clamp-3 lg:line-clamp-1">
              {courseDetail.title}
            </h2>
            {courseDetail.tagLine ? (
              <div className="mt-2 text-caption text-gray-650 line-clamp-2 lg:line-clamp-1">
                {courseDetail.tagLine}
              </div>
            ) : null}
            <div className="mt-3">
              <CourseCategoryBadge course={courseDetail} />
            </div>
          </div>
          <CourseHeaderActionCenter
            className="hidden lg:block"
            overallCourseProgress={overallCourseProgress}
            courseDetail={courseDetail}
            t={t}
          />
        </div>
      </div>
      <CourseHeaderActionCenter
        className="block lg:hidden"
        overallCourseProgress={overallCourseProgress}
        courseDetail={courseDetail}
        t={t}
      />
    </div>
  );
}
