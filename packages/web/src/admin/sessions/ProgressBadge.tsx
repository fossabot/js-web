import cx from 'classnames';
import useTranslation from '../../i18n/useTranslation';
import { CourseSessionStatus } from '../../models/course';

export interface IProgressBadge {
  status?: CourseSessionStatus;
}

function ProgressBadgeContainer({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cx(
        'rounded-xl px-2.5 py-1 text-footnote font-semibold',
        className,
      )}
    >
      {children}
    </div>
  );
}

function ProgressBadge({
  status = CourseSessionStatus.NOT_STARTED,
}: IProgressBadge) {
  const { t } = useTranslation();

  if (status === CourseSessionStatus.IN_PROGRESS) {
    return (
      <ProgressBadgeContainer className="bg-yellow-100 text-yellow-400">
        {t('sessionParticipantManagementPage.inProgress')}
      </ProgressBadgeContainer>
    );
  } else if (status === CourseSessionStatus.COMPLETED) {
    return (
      <ProgressBadgeContainer className="bg-green-100 text-green-300">
        {t('sessionParticipantManagementPage.completed')}
      </ProgressBadgeContainer>
    );
  } else if (status === CourseSessionStatus.CANCELLED) {
    return (
      <ProgressBadgeContainer className="bg-gray-200 text-gray-400">
        {t('sessionParticipantManagementPage.cancelled')}
      </ProgressBadgeContainer>
    );
  } else {
    return (
      <ProgressBadgeContainer className="bg-gray-200 text-black">
        {t('sessionParticipantManagementPage.notStarted')}
      </ProgressBadgeContainer>
    );
  }
}

export default ProgressBadge;
