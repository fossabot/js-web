import { FC } from 'react';
import { times } from 'lodash';

export const PopularTopicsSkeleton: FC<Record<string, never>> = () => {
  return (
    <div className="animate-pulse p-6 lg:flex-grow lg:p-0">
      <div className="h-6 w-44 rounded-lg bg-gray-200" />
      <div className="mt-6 border-b border-gray-200"></div>
      <div className="mt-4 grid grid-cols-1 gap-y-4 lg:mt-6 lg:grid-cols-2 lg:gap-x-8">
        {times(2, () => (
          <div className="h-36 w-full rounded-2xl bg-gray-200"></div>
        ))}
      </div>
    </div>
  );
};
