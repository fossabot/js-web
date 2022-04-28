export default function CourseItemSkeleton() {
  return (
    <div className="inline-block w-full max-w-82 flex-shrink-0 animate-pulse select-none lg:w-55">
      <div className="relative block h-0 w-full overflow-hidden rounded-3xl border border-gray-200 bg-gray-200 object-cover object-center pb-full hover:shadow lg:pb-127%">
        <div className="absolute bottom-0 left-0 right-0">
          <div className="mx-2 mb-3 flex items-center justify-between"></div>
          <div className="m-2 overflow-hidden rounded-2xl border-t border-gray-200 bg-white px-2 pt-3 pb-5">
            <div className="flex w-full items-center">
              <div className="h-3 w-3 rounded-full bg-gray-200"></div>
              <div className="ml-1 h-3 w-20 rounded-md bg-gray-200"></div>
            </div>
            <div className="mt-4 h-3 w-5/6 rounded-xl bg-gray-200 lg:w-full"></div>
            <div className="mt-3 h-3 w-full rounded-xl bg-gray-200 lg:mt-1.5 lg:w-2/3"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
