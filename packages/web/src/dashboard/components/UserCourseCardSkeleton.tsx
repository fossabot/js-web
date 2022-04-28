import cx from 'classnames';

export interface IUserCourseCardSkeleton {
  withHeader?: boolean;
  withFooter?: boolean;
}

export const UserCourseCardSkeleton = ({
  withHeader = true,
  withFooter = true,
}: IUserCourseCardSkeleton) => {
  return (
    <div
      className={cx(
        'animate-pulse lg:rounded-3xl lg:border lg:border-gray-200 lg:p-6',
      )}
    >
      {withHeader && (
        <div className="flex items-center justify-between border-t border-b border-gray-200 py-4 px-6 lg:border-t-0 lg:p-0 lg:pb-4">
          <div className="w-40 rounded-lg bg-gray-200 p-3 font-semibold text-gray-650"></div>
          <div className="flex w-16 items-center space-x-3 rounded-lg bg-gray-200 p-2 text-gray-650"></div>
        </div>
      )}
      <section className="px-6 py-4 lg:px-0">
        <div className="flex items-center space-x-4">
          <div className="h-22 w-22 rounded-2xl bg-gray-200 lg:h-36 lg:w-36"></div>
          <div className="flex-grow">
            <div className="w-32 rounded bg-gray-200 p-1.5"></div>
            <div className="mt-4 w-full rounded-lg bg-gray-200 p-2.5"></div>
            <div className="mt-4 hidden w-full rounded-lg bg-gray-200 p-2 lg:block"></div>
            <div className="mt-10 hidden w-full rounded-lg bg-gray-200 p-2 lg:block"></div>
          </div>
        </div>
      </section>
      {withFooter && (
        <div className="flex items-center justify-between border-t border-b border-gray-200 bg-gray-100 py-3 px-6 lg:rounded-2xl lg:border lg:py-2 lg:px-4">
          <div className="flex h-5 w-28 items-center space-x-2 rounded-lg bg-gray-200"></div>
          <div className="h-8 w-28 rounded-lg bg-gray-200 lg:flex lg:items-center lg:space-x-4"></div>
        </div>
      )}
    </div>
  );
};
