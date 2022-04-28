import { FC } from 'react';

interface ISessionCalendarSkeleton {
  size: 'learningStyle' | 'dayPeriod';
}

const SessionSideFilterSkeleton: FC<ISessionCalendarSkeleton> = ({ size }) => {
  const height = size === 'learningStyle' ? 158 : 210;

  return (
    <div
      className="animate-pulse rounded-lg border border-gray-200 bg-gray-100"
      style={{ width: 294, height }}
    />
  );
};

export default SessionSideFilterSkeleton;
