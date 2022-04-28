import { FC } from 'react';
import { times } from 'lodash';

const CardItem: FC<Record<string, never>> = () => {
  return (
    <div className="relative h-80 w-80 animate-pulse rounded-3xl border border-gray-200 bg-gray-200">
      <div className="absolute bottom-0 h-32 w-full space-y-3 rounded-b-3xl bg-white p-6">
        <div className="h-3.5 w-1/4 rounded bg-gray-200" />
        <div className="h-4 w-4/5 rounded-xl bg-gray-200 lg:w-full" />
        <div className="h-4 w-full rounded-xl bg-gray-200 lg:w-3/4" />
      </div>
    </div>
  );
};

export const CourseGallerySkeleton: FC<Record<string, never>> = () => {
  return (
    <>
      <div className="mt-8 animate-pulse lg:mt-12">
        <div className="mt-6 flex flex-col justify-between lg:mt-15 lg:flex-row">
          <div className="mx-6 mb-6 flex items-center space-x-4 lg:mx-0 lg:mb-0">
            <h5 className="h-6 w-40 rounded-lg bg-gray-200 text-subtitle font-semibold text-gray-900"></h5>
            <span className="h-4 w-26 rounded-lg bg-gray-200 text-gray-500"></span>
          </div>

          <div className="h-14 w-full bg-gray-200 lg:w-96 lg:rounded-lg" />
        </div>
      </div>
      <div className="mt-6 mb-12 grid grid-cols-1 justify-center gap-y-6 lg:mt-12 lg:grid-cols-4 lg:gap-x-8">
        {times(2, (index) => (
          <div key={index} className="flex justify-center lg:hidden">
            <CardItem />
          </div>
        ))}
        {times(4, (index) => (
          <div key={index} className="hidden justify-center lg:flex">
            <CardItem />
          </div>
        ))}
        <div className="mx-auto h-4 w-20 rounded-lg bg-gray-200 lg:hidden" />
      </div>
    </>
  );
};
