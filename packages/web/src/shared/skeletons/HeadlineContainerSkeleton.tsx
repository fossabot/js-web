export default function HeadlineContainerSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-4 h-8 w-11/12 rounded-md bg-gray-200 lg:mb-5 lg:w-2/5"></div>
      <div className="mb-4 h-8 w-1/3 rounded-md bg-gray-200 lg:mb-6 lg:h-4 lg:w-3/5"></div>
      <div className="mb-2 h-4 w-4/5 rounded-md bg-gray-200 lg:mb-5 lg:h-8"></div>
      <div className="mb-16 h-4 w-1/2 rounded-md bg-gray-200 lg:mb-8 lg:h-8"></div>
      <div className="mb-4 h-8 w-11/12 rounded-md bg-gray-200 lg:hidden"></div>
      <div className="mb-4 h-8 w-full rounded-md bg-gray-200 lg:hidden"></div>
      <div className="mb-6 h-8 w-8/12 rounded-md bg-gray-200 lg:hidden"></div>
    </div>
  );
}
