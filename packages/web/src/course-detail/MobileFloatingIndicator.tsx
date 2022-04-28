import cx from 'classnames';

import Button from '../ui-kit/Button';
import useTranslation from '../i18n/useTranslation';
import { IEnrolledStatus } from '../learning-track-detail/LearningTrackDetailPage';
import { ReactNode } from 'react';

export interface IMobileFloatingIndicator {
  enrolledStatus: IEnrolledStatus;
  onEnroll: () => any;
  courseMainCTA: ReactNode;
  courseProgressIndicator: ReactNode;
}

export default function MobileFloatingIndicator({
  enrolledStatus,
  onEnroll,
  courseMainCTA,
  courseProgressIndicator,
}: IMobileFloatingIndicator) {
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
          <div className="flex w-1/2 items-center py-2.5 pl-1 text-body font-semibold">
            {courseProgressIndicator}
          </div>
          {courseMainCTA}
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
          {t('courseDetailPage.enrollNow')}
        </Button>
      )}
    </div>
  );
}
