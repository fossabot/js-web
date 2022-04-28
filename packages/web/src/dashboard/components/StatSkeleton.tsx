import { FC } from 'react';

export const StatSkeleton: FC<Record<string, never>> = () => {
  return (
    <section className="animate-pulse p-4 lg:w-4/12 lg:rounded-3xl lg:border lg:border-gray-200">
      <span className="block h-5 w-44 rounded-lg bg-gray-200" />
      <div className="mt-2 hidden h-5 w-24 rounded-lg bg-gray-200 lg:block" />
      <div className="mt-4 flex items-center space-x-2 lg:mt-5">
        <div className="h-5 w-5 rounded-full bg-gray-200" />
        <span className="block h-5 w-24 rounded-lg bg-gray-200"></span>
      </div>
      <div className="mt-4 border-b border-gray-200" />
      <div className="my-6 space-y-7">
        <div className="w-full rounded-full bg-gray-200 p-3" />
        <div className="w-full rounded-full bg-gray-200 p-3" />
        <div className="w-full rounded-full bg-gray-200 p-3" />
        <div className="w-full rounded-full bg-gray-200 p-3" />
      </div>
    </section>
  );
};
