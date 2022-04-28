export default function CourseFiltersSkeleton() {
  return (
    <div className="flex animate-pulse flex-wrap items-center pb-5 lg:flex-row">
      <div className="mr-3 h-10 w-full rounded-md bg-gray-200 lg:w-8/12" />
      <div className="mt-2 border-gray-200 pr-3 lg:mt-0 lg:mr-2 lg:border-r">
        <div className="h-10 w-28 rounded-md bg-gray-200 lg:h-4 lg:w-25" />
      </div>
      <div className="mt-2.5 h-4 w-24 rounded-md bg-gray-200 lg:mt-0 lg:w-12" />
    </div>
  );
}
