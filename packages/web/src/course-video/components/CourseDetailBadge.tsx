interface ICourseDetailBadgeProps {
  icon: React.ReactNode;
  text: string;
}

function CourseDetailBadge({ icon, text }: ICourseDetailBadgeProps) {
  return (
    <div className="mr-2 mb-3 flex w-auto flex-shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 text-caption">
      {icon}
      <span className="ml-2 font-semibold">{text}</span>
    </div>
  );
}

export default CourseDetailBadge;
