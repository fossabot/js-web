import cx from 'classnames';

import Button from '../ui-kit/Button';
import useTranslation from '../i18n/useTranslation';
import LearningTrackMainCTA from './LearningTrackMainCTA';
import CourseProgressIndicator from '../course-detail/CourseProgressRing';

export default function MobileFloatingIndicator({
  enrolledStatus,
  overallLearningTrackProgress,
  onEnroll,
  outlineRef,
}) {
  const { t } = useTranslation();

  return (
    <div
      className={cx(
        'sticky bottom-4 z-10 flex-none justify-center self-center lg:hidden',
        { 'w-full': enrolledStatus?.success },
      )}
    >
      {enrolledStatus?.success ? (
        <div className="flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-gray-100 py-2 px-4">
          <div className="flex items-center py-2.5 pl-1 text-body font-semibold">
            <CourseProgressIndicator
              ringClassName="mr-2 w-6 h-6"
              overallCourseProgress={overallLearningTrackProgress}
            />
          </div>
          <LearningTrackMainCTA
            size="small"
            avoidFullWidth
            outlineRef={outlineRef}
            overallLearningTrackProgress={overallLearningTrackProgress}
          />
        </div>
      ) : (
        <Button
          avoidFullWidth
          className="font-semibold"
          size="medium"
          variant="primary"
          type="button"
          onClick={onEnroll}
        >
          {t('learningTrackDetailPage.enrollNow')}
        </Button>
      )}
    </div>
  );
}
