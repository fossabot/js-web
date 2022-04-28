import { ICourse } from '../../models/course';
import CourseItem from './CourseItem';

interface ICourseList {
  courses: ICourse<string>[];
  id: string;
  type: string;
}

export default function CourseList({ courses, id, type }: ICourseList) {
  if (!courses || !courses.length) return null;

  return (
    <div className="flex w-full flex-wrap gap-6">
      {courses.map((course, index) => (
        <CourseItem
          key={index}
          course={course}
          catalogId={id}
          catalogType={type}
        />
      ))}
    </div>
  );
}
