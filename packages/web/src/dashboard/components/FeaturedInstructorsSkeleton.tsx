import { FC } from 'react';

const InstructorCard: FC<Record<string, never>> = () => {
  return (
    <div className="flex items-center space-x-4 p-3">
      <div className="h-10 w-10 rounded-full bg-gray-200" />
      <div>
        <div className="h-4 w-32 rounded-xl bg-gray-200" />
        <div className="mt-4 h-3 w-20 rounded-xl bg-gray-200" />
      </div>
    </div>
  );
};

export const FeaturedInstructorsSkeleton: FC<Record<string, never>> = () => {
  return (
    <div className="animate-pulse p-6 lg:p-0" style={{ minWidth: 300 }}>
      <div className="h-6 w-44 rounded-lg bg-gray-200" />
      <div className="mt-6 border-b border-gray-200" />
      <div className="mt-6 space-y-4">
        <InstructorCard />
        <InstructorCard />
      </div>
    </div>
  );
};
