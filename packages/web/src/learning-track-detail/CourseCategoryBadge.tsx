import { useMemo } from 'react';

import useTranslation from '../i18n/useTranslation';
import { CourseCategoryKey } from '../models/course';
import {
  ClockGray,
  FaceToFaceGray,
  DocumentGray,
  OnlineLearningVideo,
} from '../ui-kit/icons';
import { getCourseDurationText } from '../catalog/components/CourseCategoryBadge';
import { ISectionCourse } from '../models/learningTrack';

function BadgeContainer({ children }) {
  return <div className="flex items-center justify-center">{children}</div>;
}

export default function CourseCategoryBadge({
  course,
}: {
  course: ISectionCourse;
}) {
  const { t } = useTranslation();

  const badge = useMemo(() => {
    if (course.category.key === CourseCategoryKey.ONLINE_LEARNING.toString()) {
      return (
        <>
          <BadgeContainer>
            <OnlineLearningVideo className="mr-1 h-4 w-4" />
            <span>{t('learningTrackDetailPage.online')}</span>
          </BadgeContainer>
          <div className="mx-2 flex items-center justify-center border-l border-gray-200 px-2">
            <ClockGray className="mr-1 h-4 w-4" />
            <span>{getCourseDurationText(course)}</span>
          </div>
        </>
      );
    } else if (
      course.category.key === CourseCategoryKey.LEARNING_EVENT.toString()
    ) {
      return (
        <BadgeContainer>
          <FaceToFaceGray className="mr-1 h-4 w-4" />
          <span>{t('learningTrackDetailPage.learningEvent')}</span>
        </BadgeContainer>
      );
    } else {
      return (
        <BadgeContainer>
          <DocumentGray className="mr-1 h-4 w-4" />
          <span>{t('learningTrackDetailPage.document')}</span>
        </BadgeContainer>
      );
    }
  }, [course]);

  return (
    <div className="flex items-center text-footnote font-semibold text-gray-500">
      {badge}
    </div>
  );
}
