import { useMemo } from 'react';

import ClockIcon from '../ui-kit/icons/ClockGray';
import useTranslation from '../i18n/useTranslation';
import { CourseCategory, CourseCategoryKey } from '../models/course';
import VirtualClass from '../ui-kit/icons/VirtualClass';
import OnlineLearningIcon from '../ui-kit/icons/OnlineLearning';
import { getCourseDurationText } from '../catalog/components/CourseCategoryBadge';

function BadgeContainer({ children }) {
  return <div className="flex items-center justify-center">{children}</div>;
}

export default function LearningTrackCategoryBadge({
  category,
  durationMonths,
  durationDays,
  durationHours,
  durationMinutes,
  durationWeeks,
}: {
  category?: CourseCategory<CourseCategoryKey>;
  durationMonths: number;
  durationWeeks: number;
  durationDays: number;
  durationHours: number;
  durationMinutes: number;
}) {
  const { t } = useTranslation();

  const badge = useMemo(() => {
    if (category.key === CourseCategoryKey.ONLINE_LEARNING.toString()) {
      return (
        <>
          <BadgeContainer>
            <OnlineLearningIcon className="mr-1" />
            <span>{t('learningTrackListPage.online')}</span>
          </BadgeContainer>
          <div className="flex items-center justify-center">
            <ClockIcon className="mr-1" />
            <span>
              {getCourseDurationText({
                durationDays,
                durationHours,
                durationMinutes,
                durationMonths,
                durationWeeks,
              })}
            </span>
          </div>
        </>
      );
    } else if (category.key === CourseCategoryKey.LEARNING_EVENT.toString()) {
      return (
        <BadgeContainer>
          <VirtualClass className="mr-1" />
          <span>{t('learningTrackListPage.learningEvent')}</span>
        </BadgeContainer>
      );
    }
  }, [
    category.key,
    durationDays,
    durationHours,
    durationMinutes,
    durationMonths,
    durationWeeks,
    t,
  ]);

  if (!category) return null;
  if (
    !(
      category.key === CourseCategoryKey.ONLINE_LEARNING.toString() ||
      category.key === CourseCategoryKey.LEARNING_EVENT.toString()
    )
  )
    return null;

  return (
    <div className="mb-2 flex h-2.5 items-center justify-between text-footnote font-semibold text-gray-500">
      {badge}
    </div>
  );
}
