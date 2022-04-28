import cx from 'classnames';
import Link from 'next/link';
import { useMemo } from 'react';

import Picture from '../../ui-kit/Picture';
import { ICourse } from '../../models/course';
import WEB_PATHS from '../../constants/webPaths';
import SoundUpIcon from '../../ui-kit/icons/SoundUp';
import CourseCategoryBadge from './CourseCategoryBadge';
import BadgeCheckIcon from '../../ui-kit/icons/BadgeCheck';
import { stringifyUrl } from 'query-string';
import { useRouter } from 'next/router';
import useTranslation from '../../i18n/useTranslation';
import { UserAssignedCourseType } from '../../models/userAssignedCourse';
interface ICourseItem {
  course: Pick<
    ICourse<string>,
    | 'id'
    | 'imageKey'
    | 'hasCertificate'
    | 'userAssignedCourse'
    | 'featured'
    | 'title'
    | 'availableLanguage'
  >;
  catalogId?: string;
  catalogType?: string;
}

interface IAttributeBadge {
  hidden?: boolean;
  children: React.ReactNode;
}

function AttributeBadge({ hidden = false, children }: IAttributeBadge) {
  return (
    <div
      className={cx(
        'flex items-center justify-center rounded-2xl bg-backdrop-lightbox px-2 py-1 backdrop-blur backdrop-filter',
        hidden && 'opacity-0',
      )}
    >
      {children}
    </div>
  );
}

function getCourseLang(lang) {
  const langUpperCase = lang.toUpperCase();
  return langUpperCase === 'ALL' ? 'EN / TH' : langUpperCase;
}

export default function CourseItem({
  course,
  catalogId,
  catalogType,
}: ICourseItem) {
  const { t } = useTranslation();
  const router = useRouter();
  const availableLang = course.availableLanguage;
  const langUpperCase = useMemo(
    () => getCourseLang(availableLang),
    [availableLang],
  );
  const query: { [key: string]: string } = {};

  if (catalogType && catalogId) {
    if (catalogType === 'learningWay') query.learningWayId = catalogId;
    else query.topicId = catalogId;
  }

  const href = course?.id
    ? stringifyUrl({
        url: `${WEB_PATHS.COURSE_DETAIL.replace(':id', course.id)}`,
        query,
      })
    : stringifyUrl({
        url: router.pathname,
        query: router.query,
      });

  return (
    <div className="relative w-full max-w-82 select-none overflow-hidden rounded-3xl border border-gray-200 hover:shadow lg:w-55">
      <Link href={href}>
        <a className="block h-0 w-full pb-full lg:pb-127%">
          {!course.imageKey ? (
            <Picture
              className="absolute top-0 left-0 h-full w-full object-cover object-center"
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
              src={`${process.env.NEXT_PUBLIC_CDN_BASE_URL}/${course.imageKey}`}
              className="absolute top-0 left-0 h-full w-full object-cover object-center"
            />
          )}
          <div className="absolute bottom-0 left-0 right-0">
            <div className="mx-2 mb-3 flex items-center justify-between">
              <AttributeBadge hidden={!course.hasCertificate}>
                <BadgeCheckIcon className="mr-1 text-brand-primary" />
                <span className="text-caption font-semibold text-brand-primary">
                  {t('courseItem.certificate')}
                </span>
              </AttributeBadge>
              <AttributeBadge>
                <SoundUpIcon className="-mt-0.5 mr-0.5" />
                <span className="text-footnote font-semibold text-gray-600">
                  {langUpperCase}
                </span>
              </AttributeBadge>
            </div>
            <div
              className={cx(
                'h-25 overflow-hidden border-t border-gray-200',
                course.featured
                  ? 'm-2 rounded-2xl bg-backdrop-lightbox px-2 py-2 backdrop-blur backdrop-filter'
                  : 'bg-white px-4 py-3',
              )}
            >
              <CourseCategoryBadge course={course} />
              <div className="text-caption font-semibold line-clamp-3">
                {course.userAssignedCourse?.[0]?.assignmentType ===
                  UserAssignedCourseType.Optional && (
                  <>
                    <span className="inline-block rounded-2xl bg-orange-300 py-0.5 px-2 text-footnote text-white">
                      {t('courseItem.assigned')}
                    </span>{' '}
                  </>
                )}{' '}
                {course.userAssignedCourse?.[0]?.assignmentType ===
                  UserAssignedCourseType.Required && (
                  <>
                    <span className="inline-block rounded-2xl bg-brand-primary py-0.5 px-2 text-footnote text-white">
                      {t('courseItem.required')}
                    </span>{' '}
                  </>
                )}
                <span>{course.title}</span>
              </div>
            </div>
          </div>
        </a>
      </Link>
    </div>
  );
}
