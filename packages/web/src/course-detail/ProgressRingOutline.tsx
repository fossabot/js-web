import { useMemo } from 'react';
import { padStart } from 'lodash';
import { ProgressCircleOutline, Check } from '../ui-kit/icons';

interface IProgressRingOutline {
  percentage: number;
  sequence: number;
}

function ProgressRingOutline({ percentage, sequence }: IProgressRingOutline) {
  const percent = useMemo(
    () => (percentage > 100 ? 100 : percentage < 0 ? 0 : percentage),
    [percentage],
  );

  const displayNumber = useMemo(
    () => padStart(sequence.toString(), 2, '0'),
    [sequence],
  );

  return (
    <div className="relative">
      <ProgressCircleOutline percentage={percent} className="h-15 w-15" />
      <div className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 transform">
        {percentage >= 100 ? (
          <Check className="h-5 w-5 text-green-200" />
        ) : (
          <div className="text-body font-bold text-black">{displayNumber}</div>
        )}
      </div>
    </div>
  );
}

export default ProgressRingOutline;
