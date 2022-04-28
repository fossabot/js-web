import cx from 'classnames';
import Link from 'next/link';
import { useMemo } from 'react';
import WEB_PATHS from '../constants/webPaths';
import CourseProgressIndicator from '../course-detail/CourseProgressRing';
import { getLanguageValue } from '../i18n/lang-utils';
import useTranslation from '../i18n/useTranslation';
import { UserAssignedCourseType } from '../models/userAssignedCourse';
import { searchTypes } from '../ui-kit/headers/useSearchBar';
import { SoundUp } from '../ui-kit/icons';
import BadgeCheckIcon from '../ui-kit/icons/BadgeCheck';
import Picture from '../ui-kit/Picture';
import SearchCardBadge from './SearchCardBadge';

export interface ISearchResultCardProps {
  id: string;
  title: string;
  titleEn: string;
  titleTh: string;
  imageKey: string;
  href: string;
  categoryKey: string;
  hasCertificate: boolean;
  language: string;
  subTypes: string[];
  searchType: string;
  searchSubType: string;
  durationMonths?: number;
  durationWeeks?: number;
  durationDays?: number;
  durationHours?: number;
  durationMinutes?: number;
  progressPercentage?: number;
  assignmentType?: UserAssignedCourseType;
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
  if (!lang) {
    return;
  }
  const langUpperCase = lang.toUpperCase();
  return langUpperCase === 'ALL' ? 'EN / TH' : langUpperCase;
}

export default function SearchResultCard(props: ISearchResultCardProps) {
  const { t } = useTranslation();

  const langUpperCase = useMemo(
    () => getCourseLang(props.language),
    [props.language],
  );

  const href =
    props.searchType === searchTypes.LEARNING_TRACK
      ? WEB_PATHS.LEARNING_TRACK_DETAIL.replace(':id', props.id)
      : WEB_PATHS.COURSE_DETAIL.replace(':id', props.id);

  return (
    <div className="relative box-content w-full max-w-82 select-none overflow-hidden rounded-3xl border border-gray-200 hover:shadow lg:w-55">
      <Link href={href}>
        <a className="block h-0 w-full pb-full lg:pb-127%">
          {!props.imageKey ? (
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
              src={`${process.env.NEXT_PUBLIC_CDN_BASE_URL}/${props.imageKey}`}
              className="absolute top-0 left-0 h-full w-full object-cover object-center"
            />
          )}
          {props.progressPercentage !== undefined && (
            <div className="absolute right-0 top-0">
              <div className="mt-3 mr-3 flex items-center rounded-2xl bg-backdrop-lightbox px-2 py-1 text-caption font-semibold backdrop-blur backdrop-filter">
                <CourseProgressIndicator
                  ringClassName="mr-1 w-4 h-4"
                  textClassName="text-footnote font-semibold"
                  overallCourseProgress={props.progressPercentage}
                />
              </div>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0">
            <div className="mx-2 mb-3 flex items-center justify-between">
              <AttributeBadge hidden={!props.hasCertificate}>
                <BadgeCheckIcon className="mr-1 text-brand-primary" />
                <span className="text-caption font-semibold text-brand-primary">
                  {t('searchResultPage.certificate')}
                </span>
              </AttributeBadge>
              {langUpperCase && (
                <AttributeBadge>
                  <SoundUp className="-mt-0.5 mr-0.5" />
                  <span className="text-footnote font-semibold text-gray-600">
                    {langUpperCase}
                  </span>
                </AttributeBadge>
              )}
            </div>
            <div className="h-25 overflow-hidden border-t border-gray-200 bg-white px-4 py-3">
              <SearchCardBadge
                subTypes={props.subTypes}
                searchType={props.searchType}
                searchSubType={props.searchSubType}
                {...props}
              />
              <div className="ml-0.5 text-caption font-semibold line-clamp-3">
                {props.assignmentType === UserAssignedCourseType.Optional && (
                  <>
                    <span className="rounded-2xl bg-orange-300 py-0.5 px-2 text-footnote text-white">
                      {t('courseItem.assigned')}
                    </span>{' '}
                  </>
                )}{' '}
                {props.assignmentType === UserAssignedCourseType.Required && (
                  <>
                    <span className="rounded-2xl bg-brand-primary py-0.5 px-2 text-footnote text-white">
                      {t('courseItem.required')}
                    </span>{' '}
                  </>
                )}
                {getLanguageValue({
                  nameEn: props.titleEn,
                  nameTh: props.titleTh,
                })}
              </div>
            </div>
          </div>
        </a>
      </Link>
    </div>
  );
}
