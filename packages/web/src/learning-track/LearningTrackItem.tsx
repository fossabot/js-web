import cx from 'classnames';
import Link from 'next/link';
import WEB_PATHS from '../constants/webPaths';
import useTranslation from '../i18n/useTranslation';
import { CourseCategoryKey } from '../models/course';
import { ILearningTrack } from '../models/learningTrack';
import BadgeCheckIcon from '../ui-kit/icons/BadgeCheck';
import Picture from '../ui-kit/Picture';
import LearningTrackCategoryBadge from './LearningTrackCategoryBadge';

interface ILearningTrackItem {
  learningTrack: Pick<
    ILearningTrack<string>,
    | 'id'
    | 'imageKey'
    | 'title'
    | 'hasCertificate'
    | 'isFeatured'
    | 'userAssignedLearningTrack'
    | 'category'
    | 'durationDays'
    | 'durationHours'
    | 'durationMinutes'
    | 'durationMonths'
    | 'durationWeeks'
  >;
  topicId?: string;
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

export default function LearningTrackItem({
  learningTrack,
  topicId,
}: ILearningTrackItem) {
  const { t } = useTranslation();

  return (
    <div className="relative w-full max-w-82 select-none overflow-hidden rounded-3xl border border-gray-200 hover:shadow lg:w-55">
      <Link
        href={`${WEB_PATHS.LEARNING_TRACK_DETAIL.replace(
          ':id',
          learningTrack?.id,
        )}${topicId ? '?topicId=' + topicId : ''}`}
      >
        <a className="block h-0 w-full pb-full lg:pb-127%">
          {!learningTrack.imageKey ? (
            <Picture
              className="absolute top-0 left-0 h-full w-full object-cover object-center-top"
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
              src={`${process.env.NEXT_PUBLIC_CDN_BASE_URL}/${learningTrack.imageKey}`}
              alt={learningTrack.title}
              className="absolute h-full w-full object-cover object-top"
            />
          )}
          <div className="absolute bottom-0 left-0 right-0">
            <div className="mx-2 mb-3 flex items-center justify-between">
              <AttributeBadge hidden={!learningTrack.hasCertificate}>
                <BadgeCheckIcon className="mr-1 text-brand-primary" />
                <span className="text-caption font-semibold text-brand-primary">
                  Certificate
                </span>
              </AttributeBadge>
            </div>
            <div
              className={cx(
                'h-25 overflow-hidden border-t border-gray-200',
                learningTrack.isFeatured
                  ? 'm-2 rounded-2xl bg-backdrop-lightbox px-2 py-2 backdrop-blur backdrop-filter'
                  : 'bg-white px-4 py-3',
              )}
            >
              <LearningTrackCategoryBadge {...learningTrack} />

              <div className="text-caption font-semibold line-clamp-3">
                {learningTrack.userAssignedLearningTrack?.[0] && (
                  <>
                    <span className="inline-block rounded-2xl bg-orange-300 py-0.5 px-2 text-footnote text-white">
                      {t('learningTrackItem.assigned')}
                    </span>{' '}
                  </>
                )}
                {learningTrack.title}
              </div>
            </div>
          </div>
        </a>
      </Link>
    </div>
  );
}
