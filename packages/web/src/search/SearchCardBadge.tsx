import { useMemo } from 'react';

import ClockIcon from '../ui-kit/icons/ClockGray';
import useTranslation from '../i18n/useTranslation';
import VirtualClass from '../ui-kit/icons/VirtualClass';
import OnlineLearningIcon from '../ui-kit/icons/OnlineLearning';
import { LearningWayKey } from '../models/learning-way';
import { searchTypes } from '../ui-kit/headers/useSearchBar';
import { FaceToFaceGray, LearningTrack } from '../ui-kit/icons';
import { CourseCategoryKey, CourseSubCategoryKey } from '../models/course';
import { getCourseDurationText } from '../catalog/components/CourseCategoryBadge';

function BadgeContainer({ children }) {
  return <div className="flex items-center justify-center">{children}</div>;
}

export default function SearchCardBadge({
  categoryKey,
  subTypes,
  searchType,
  searchSubType,
  ...rest
}: {
  categoryKey: string;
  subTypes: string[];
  searchType: string;
  searchSubType: string;
  durationMonths?: number;
  durationWeeks?: number;
  durationDays?: number;
  durationHours?: number;
  durationMinutes?: number;
}) {
  const { t } = useTranslation();

  const badge = useMemo(() => {
    if (searchType === searchTypes.LEARNING_TRACK) {
      return (
        <BadgeContainer>
          <LearningTrack className="mr-1 h-4 w-4" />
          <span>{t('searchResultPage.learningTrack')}</span>
        </BadgeContainer>
      );
    } else if (
      searchSubType === CourseSubCategoryKey.VIRTUAL ||
      subTypes?.some((it) => it === CourseSubCategoryKey.VIRTUAL)
    ) {
      return (
        <BadgeContainer>
          <VirtualClass className="mr-1 h-4 w-4" />
          <span>{t('searchResultPage.virtualClass')}</span>
        </BadgeContainer>
      );
    } else if (
      searchSubType === CourseSubCategoryKey.FACE_TO_FACE ||
      subTypes?.some((it) => it === CourseSubCategoryKey.FACE_TO_FACE)
    ) {
      return (
        <BadgeContainer>
          <FaceToFaceGray className="mr-1 h-4 w-4" />
          <span>{t('searchResultPage.f2f')}</span>
        </BadgeContainer>
      );
    } else if (
      (searchType === searchTypes.COURSE &&
        searchSubType === CourseCategoryKey.ONLINE_LEARNING) ||
      (searchType === searchTypes.LINE_OF_LEARNING &&
        searchSubType === LearningWayKey.ONLINE) ||
      categoryKey === CourseCategoryKey.ONLINE_LEARNING
    ) {
      return (
        <>
          <BadgeContainer>
            <OnlineLearningIcon className="mr-1 h-4 w-4" />
            <span>{t('searchResultPage.online')}</span>
          </BadgeContainer>
          {rest && !!getCourseDurationText(rest) && (
            <div className="flex items-center justify-center">
              <ClockIcon className="mr-1" />
              <span>{getCourseDurationText(rest)}</span>
            </div>
          )}
        </>
      );
    }

    return null;
  }, [rest, categoryKey, subTypes, searchSubType]);

  if (!categoryKey) return null;

  if (!badge) {
    return null;
  }

  return (
    <div className="mb-2 flex h-2.5 items-center justify-between text-footnote font-semibold text-gray-500">
      {badge}
    </div>
  );
}
