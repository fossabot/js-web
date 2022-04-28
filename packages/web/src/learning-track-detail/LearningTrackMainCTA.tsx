import { MutableRefObject } from 'react';

import Button from '../ui-kit/Button';
import { PlayCircle } from '../ui-kit/icons';
import useTranslation from '../i18n/useTranslation';

export default function LearningTrackMainCTA({
  overallLearningTrackProgress,
  outlineRef,
  avoidFullWidth = false,
  size = 'medium',
}: {
  overallLearningTrackProgress: number;
  outlineRef: MutableRefObject<any>;
  avoidFullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
}) {
  const { t } = useTranslation();

  const onClick = () => {
    outlineRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
    });
  };

  return (
    <Button
      className="font-semibold"
      size={size}
      avoidFullWidth={avoidFullWidth}
      variant={overallLearningTrackProgress < 100 ? 'primary' : 'secondary'}
      type="button"
      onClick={onClick}
      iconRight={
        overallLearningTrackProgress < 100 ? (
          <PlayCircle className="ml-1 h-5 w-5 font-semibold text-brand-primary" />
        ) : null
      }
    >
      {overallLearningTrackProgress <= 0 && t('learningTrackDetailPage.begin')}
      {overallLearningTrackProgress > 0 &&
        overallLearningTrackProgress < 100 &&
        t('learningTrackDetailPage.continue')}
    </Button>
  );
}
