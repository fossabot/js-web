import { useMemo } from 'react';
import useTranslation from '../../i18n/useTranslation';
import { CourseCategoryKey, CourseSubCategoryKey } from '../../models/course';
import {
  Clock,
  VirtualClass,
  OnlineLearning,
  DocumentGray,
} from '../../ui-kit/icons';

export interface IDurationProps {
  durationMonths?: number;
  durationWeeks?: number;
  durationDays?: number;
  durationHours?: number;
  durationMinutes?: number;
}

export const getCourseDurationText = ({
  durationMonths,
  durationWeeks,
  durationDays,
  durationHours,
  durationMinutes,
}: IDurationProps) => {
  const chunks = [
    durationMonths ? durationMonths + 'mo' : null,
    durationWeeks ? durationWeeks + 'w' : null,
    durationDays ? durationDays + 'd' : null,
    durationHours ? durationHours + 'h' : null,
    durationMinutes ? durationMinutes + ' min' : null,
  ].filter((c) => !!c);

  return chunks.slice(0, 2).join(' ');
};

function BadgeContainer({ children }) {
  return <div className="flex items-center justify-center">{children}</div>;
}

export default function CourseCategoryBadge({ course }) {
  const { t } = useTranslation();

  const badge = useMemo(() => {
    if (
      course.courseCategory?.key ===
      CourseCategoryKey.ONLINE_LEARNING.toString()
    ) {
      return (
        <>
          <BadgeContainer>
            <OnlineLearning className="mr-1" />{' '}
            <span>{t('catalogList.online')}</span>
          </BadgeContainer>
          <div className="flex items-center justify-center">
            <Clock className="mr-1" />{' '}
            <span>{getCourseDurationText(course)}</span>
          </div>
        </>
      );
    } else if (
      course.courseSubCategories?.some(
        (it) => it.key === CourseSubCategoryKey.VIRTUAL,
      )
    ) {
      return (
        <BadgeContainer>
          <VirtualClass className="mr-1" />{' '}
          <span>{t('catalogList.virtualClass')}</span>
        </BadgeContainer>
      );
    } else if (
      course.courseSubCategories?.some(
        (it) => it.key === CourseSubCategoryKey.DOCUMENT.toString(),
      )
    ) {
      return (
        <BadgeContainer>
          <DocumentGray className="mr-1" />{' '}
          <span>{t('catalogList.document')}</span>
        </BadgeContainer>
      );
    }
  }, [course]);

  if (!course.courseCategory && !course.courseSubCategories?.length)
    return null;

  return (
    <div className="mb-2 flex h-2.5 items-center justify-between text-footnote font-semibold text-gray-500">
      {badge}
    </div>
  );
}
