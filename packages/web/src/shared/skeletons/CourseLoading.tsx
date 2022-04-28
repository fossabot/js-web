import CourseItemSkeleton from './CourseItemSkeleton';

export default function CourseLoading() {
  return (
    <div className="flex w-full flex-wrap gap-6">
      <CourseItemSkeleton />
      <div className="hidden lg:inline-block">
        <CourseItemSkeleton />
      </div>
      <div className="hidden lg:inline-block">
        <CourseItemSkeleton />
      </div>
    </div>
  );
}
