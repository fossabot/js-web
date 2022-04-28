import cx from 'classnames';
import useTranslation from '../../i18n/useTranslation';
import { UserAssignedLearningTrackType } from '../../models/userAssignedLearningTrack';
import { Thumb } from '../../ui-kit/icons';

interface ILearningTrackAssignmentStatusProps {
  type: UserAssignedLearningTrackType;
}

export const LearningTrackAssignmentStatus = ({
  type,
}: ILearningTrackAssignmentStatusProps) => {
  const { t } = useTranslation();

  return (
    <div
      className={cx(
        'flex items-center space-x-1.5 rounded-2xl py-0.5 px-3 text-caption text-white',
        {
          'bg-orange-300': type === UserAssignedLearningTrackType.Optional,
        },
      )}
    >
      {type === UserAssignedLearningTrackType.Optional && (
        <>
          <Thumb />
          <span>{t(`learningTrackItem.assigned`)}</span>
        </>
      )}
    </div>
  );
};
