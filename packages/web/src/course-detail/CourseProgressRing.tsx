import useTranslation from '../i18n/useTranslation';
import { ProgressCircle } from '../ui-kit/icons';

export default function CourseProgressIndicator({
  overallCourseProgress,
  ringClassName,
  textClassName,
}: {
  overallCourseProgress: number;
  ringClassName: string;
  textClassName?: string;
}) {
  const { t } = useTranslation();

  return (
    <>
      <ProgressCircle
        className={ringClassName}
        percentage={overallCourseProgress}
      />
      <span className={textClassName}>
        {overallCourseProgress <= 0 && (
          <span className="text-gray-500">
            {t('courseDetailPage.notStarted')}
          </span>
        )}
        {overallCourseProgress > 0 && overallCourseProgress < 100 && (
          <span className="text-yellow-300">
            {overallCourseProgress}% {t('courseDetailPage.progress')}
          </span>
        )}
        {overallCourseProgress === 100 && (
          <span className="text-green-300">
            {t('courseDetailPage.finished')}
          </span>
        )}
      </span>
    </>
  );
}
