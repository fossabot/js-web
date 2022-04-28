import { MouseEventHandler } from 'react';
import useTranslation from '../i18n/useTranslation';
import { CourseSubCategoryKey, ICourseDetail } from '../models/course';
import Button from '../ui-kit/Button';
import { ArrowRepeat, ExternalLink, PlayCircle } from '../ui-kit/icons';
import cx from 'classnames';
import { useCourseAssessment } from './useCourseAssessment';

export interface ICourseMainCTA {
  overallCourseProgress: number;
  courseDetail: ICourseDetail;
  avoidFullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  onCTA: MouseEventHandler<HTMLButtonElement>;
}

export default function CourseMainCTA({
  overallCourseProgress,
  courseDetail,
  avoidFullWidth = false,
  size = 'medium',
  loading = false,
  onCTA,
}: ICourseMainCTA) {
  const { t } = useTranslation();
  const { isAssessmentCourse, isRetestable } =
    useCourseAssessment(courseDetail);

  const courseOutlineFirstCategoryKey =
    courseDetail.courseOutlines[0].category.key;

  function getButtonText() {
    const playCircle = overallCourseProgress < 100 && (
      <PlayCircle className="ml-1 h-5 w-5 font-semibold text-brand-primary" />
    );
    if (isAssessmentCourse()) {
      if (overallCourseProgress >= 100 && isRetestable()) {
        return {
          text: (
            <span className="text-caption">
              {t('courseDetailPage.retest')}
              <span className="ml-1 hidden lg:inline">
                {t('courseDetailPage.assessment')}
              </span>
            </span>
          ),
          icon: <ArrowRepeat className="ml-1 hidden h-5 w-5 lg:block" />,
        };
      }
      return {
        text: (
          <span className="text-caption">
            {t('courseDetailPage.start')}
            <span className="ml-1 hidden lg:inline">
              {t('courseDetailPage.assessment')}
            </span>
          </span>
        ),
        icon: <ExternalLink className="ml-1 hidden h-4 w-4 lg:block" />,
      };
    }
    if (overallCourseProgress <= 0) {
      return {
        text: t('courseDetailPage.begin'),
        icon: playCircle,
      };
    }
    if (overallCourseProgress > 0 && overallCourseProgress < 100) {
      return {
        text: t('courseDetailPage.continue'),
        icon: playCircle,
      };
    }
    if (
      overallCourseProgress >= 100 &&
      courseOutlineFirstCategoryKey === CourseSubCategoryKey.LINK
    ) {
      return {
        text: t('courseDetailPage.goToCourse'),
        icon: playCircle,
      };
    }
    if (
      overallCourseProgress >= 100 &&
      courseOutlineFirstCategoryKey === CourseSubCategoryKey.VIDEO
    ) {
      return {
        text: t('courseDetailPage.playlist'),
        icon: playCircle,
      };
    }
    if (
      overallCourseProgress >= 100 &&
      courseOutlineFirstCategoryKey !== CourseSubCategoryKey.LINK &&
      courseOutlineFirstCategoryKey !== CourseSubCategoryKey.VIDEO
    ) {
      return {
        text: t('courseDetailPage.courseOutline'),
        icon: playCircle,
      };
    }
  }

  const { icon, text } = getButtonText();

  return (
    <Button
      className={cx('whitespace-nowrap font-semibold', {
        hidden:
          isAssessmentCourse() &&
          !isRetestable() &&
          overallCourseProgress >= 100,
      })}
      size={size}
      avoidFullWidth={avoidFullWidth}
      variant={overallCourseProgress < 100 ? 'primary' : 'secondary'}
      type="button"
      onClick={onCTA}
      iconRight={loading ? null : icon}
      isLoading={loading}
      disabled={loading}
    >
      {text}
    </Button>
  );
}
