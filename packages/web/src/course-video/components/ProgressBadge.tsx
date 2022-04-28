import { padStart } from 'lodash';
import { useMemo } from 'react';
import { Check, ProgressCircleVideo } from '../../ui-kit/icons';

interface IProgressBarProps {
  sequence: number;
  percentage: number;
}

function ProgressBadge({ sequence, percentage }: IProgressBarProps) {
  const percent = useMemo(
    () => (percentage > 100 ? 100 : percentage < 0 ? 0 : percentage),
    [percentage],
  );

  const displayNumber = useMemo(
    () => padStart(sequence.toString(), 2, '0'),
    [sequence],
  );

  return (
    <div className="relative h-8 w-8">
      <ProgressCircleVideo percentage={percent} className="h-full w-full" />
      <div className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 transform">
        {percentage >= 100 ? (
          <Check className="h-5 w-5 text-green-200" />
        ) : (
          <div className="text-caption font-semibold text-white">
            {displayNumber}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProgressBadge;
