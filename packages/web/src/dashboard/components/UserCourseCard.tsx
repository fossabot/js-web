import cx from 'classnames';
import Link from 'next/link';
import { FC } from 'react';
import WEB_PATHS from '../../constants/webPaths';
import { getCurrentCourseOutline } from '../../course-detail/helper';
import useTranslation from '../../i18n/useTranslation';
import { CourseCategoryKey, ICourse } from '../../models/course';
import Button from '../../ui-kit/Button';
import { ContentLineClamp } from '../../ui-kit/ContentLineClamp/ContentLineClamp';
import {
  ArrowRight,
  BadgeCheck,
  DocumentGray,
  FaceToFaceGray,
  LessonGray,
  OnlineLearningVideo,
  PlayCircle,
  ProgressCircle,
} from '../../ui-kit/icons';
import Picture from '../../ui-kit/Picture';

const CourseTag: FC<{ course: ICourse; className?: string }> = (props) => {
  const { course, className } = props;
  const { t } = useTranslation();

  return (
    <div
      className={cx(
        'mt-4 flex space-x-2 text-caption font-semibold',
        className,
      )}
    >
      <div className="flex items-center space-x-1">
        {course.category.key === CourseCategoryKey.LEARNING_EVENT && (
          <>
            <FaceToFaceGray className="h-4 w-4" />
            <span className="text-gray-650">
              {t('dashboardCourseListPage.virtualAndFaceToFace')}
            </span>
          </>
        )}
        {course.category.key === CourseCategoryKey.MATERIAL && (
          <>
            <DocumentGray className="h-4 w-4" />
            <span className="text-gray-650">
              {t('dashboardCourseListPage.document')}
            </span>
          </>
        )}
        {course.category.key === CourseCategoryKey.ONLINE_LEARNING && (
          <>
            <OnlineLearningVideo className="h-4 w-4" />
            <span className="text-gray-650">
              {t('dashboardCourseListPage.onlineCourse')}
            </span>
          </>
        )}
      </div>
      <div className="border-r border-gray-300" />
      <div className="flex items-center space-x-1">
        <LessonGray />
        <span className="text-gray-650">
          {course.courseOutlines.length} {t('dashboardHomePage.lessons')}
        </span>
      </div>
      {course.hasCertificate && (
        <>
          <div className="border-r border-gray-300" />
          <div className="hidden lg:flex lg:items-center lg:space-x-1 lg:text-caption lg:font-semibold">
            <BadgeCheck className="text-gray-500" />
            <span className="text-gray-650">
              {t('dashboardHomePage.certificate')}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export interface IUserCourseCard {
  course: ICourse;
  className?: string;
}

export const UserCourseCard: FC<IUserCourseCard> = (props) => {
  const { t } = useTranslation();
  const { className, course } = props;
  const nextUp = getCurrentCourseOutline(
    course.courseOutlines.map((co) => ({
      ...co,
      userCourseOutlineProgress: co.userCourseOutlineProgress,
      courseRuleItems: [],
    })),
  );

  const percentage = course.userEnrolledCourse.length
    ? course.userEnrolledCourse[0].percentage
    : 0;

  return (
    <div
      className={cx(
        'lg:rounded-3xl lg:border lg:border-gray-200 lg:p-6',
        className,
      )}
    >
      <div className="flex items-center justify-between border-t border-b border-gray-200 py-4 px-6 lg:border-t-0 lg:p-0 lg:pb-4">
        <div className="font-semibold text-gray-650">
          {t('dashboardHomePage.continueCourse')}
        </div>
        <Link href={WEB_PATHS.DASHBOARD_COURSES + '?tab=in-progress'}>
          <a>
            <div className="flex items-center space-x-3 text-gray-650">
              <span className="text-footnote font-semibold">
                {t('dashboardHomePage.seeAll')}
              </span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </a>
        </Link>
      </div>
      <section className="px-6 py-4 lg:px-0">
        <div className="flex items-center space-x-4">
          <div className="w-20 lg:w-36">
            {!course.imageKey ? (
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
                alt={course.title}
                src={`${process.env.NEXT_PUBLIC_CDN_BASE_URL}/${course.imageKey}`}
              />
            )}
          </div>
          <div className="w-full">
            <div className="text-footnote text-gray-650">
              {course.topics[0]?.name}
            </div>
            <div className="mt-1 text-body font-bold">{course.title}</div>
            <div className="mt-2 text-caption text-gray-500">
              <ContentLineClamp
                allowLines={1}
                collapsable={false}
                content={course.description}
                lineHeight={20}
              />
            </div>
            <CourseTag className="hidden lg:flex" course={course} />
          </div>
        </div>
        <CourseTag className="lg:hidden" course={course} />
        {course.hasCertificate && (
          <div className="mt-4 flex items-center space-x-1 text-caption font-semibold lg:hidden">
            <BadgeCheck className="text-gray-500" />
            <span className="text-gray-650">
              {t('dashboardHomePage.certificate')}
            </span>
          </div>
        )}
      </section>
      <div className="flex justify-between border-t border-b border-gray-200 bg-gray-100 py-3 px-6 lg:rounded-2xl lg:border lg:py-2 lg:px-4">
        <div className="flex items-center space-x-2">
          <ProgressCircle percentage={percentage} className="h-5 w-5" />
          {percentage > 0 ? (
            <span className="text-caption font-semibold text-yellow-300">
              {percentage}% {t('dashboardHomePage.progress')}
            </span>
          ) : (
            <span className="text-caption font-semibold text-gray-500">
              {t('dashboardHomePage.notStarted')}
            </span>
          )}
        </div>
        <div className="lg:flex lg:items-center lg:space-x-4">
          {nextUp && (
            <div className="hidden lg:block lg:w-60 lg:text-right lg:text-caption lg:text-gray-500 lg:line-clamp-1">
              {nextUp.text}
            </div>
          )}
          <Link href={WEB_PATHS.COURSE_DETAIL.replace(':id', course.id)}>
            <a>
              <Button avoidFullWidth variant="primary">
                <div className="flex items-center space-x-1 px-4 py-2">
                  <span className="text-caption">
                    {t('dashboardHomePage.continue')}
                  </span>
                  <PlayCircle className="text-brand-primary" />
                </div>
              </Button>
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
};
