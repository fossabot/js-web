import { FC } from 'react';

const SessionItemSkeleton: FC = () => (
  <div className="flex w-full animate-pulse flex-col divide-y divide-gray-200 rounded-3xl border border-gray-200 bg-white p-6">
    <div className="flex flex-col pb-4 lg:flex-row lg:space-x-4">
      <div className="h-22 w-22 rounded-2xl bg-gray-200" />
      <div className="mt-4 flex flex-col space-y-2 lg:mt-0">
        <div className="h-4 w-26 rounded-lg bg-gray-200 lg:w-28" />
        <div className="h-6 w-5/6 rounded-lg bg-gray-200 lg:w-72" />
        <div className="h-4 w-44 rounded-lg bg-gray-200 lg:w-28" />
        <div className="flex flex-row items-center pt-8">
          <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gray-200 lg:hidden" />
          <div className="mr-2 hidden h-4 w-12 rounded-lg bg-gray-200 lg:flex" />
          <div className="hidden h-full w-px bg-gray-200 lg:flex" />
          <div className="ml-2 h-4 w-36 rounded-lg bg-gray-200 lg:w-24" />
        </div>
      </div>
      <div className="hidden flex-col items-end space-y-2 lg:flex">
        <div className="h-6 w-36 rounded-lg bg-gray-200" />
        <div className="h-4 w-20 rounded-lg bg-gray-200" />
      </div>
    </div>
    <div className="flex flex-row items-center pt-4 lg:space-x-3">
      <div className="hidden h-8 w-8 flex-shrink-0 rounded-full bg-gray-200 lg:flex" />
      <div className="flex w-full flex-row items-center justify-between">
        <div className="h-4 w-25 rounded-lg bg-gray-200 lg:w-36" />
        <div className="h-9 w-25 rounded-lg bg-gray-200 lg:h-4 lg:w-20" />
      </div>
    </div>
  </div>
);

export default SessionItemSkeleton;
