import { ICourse, ICourseDetail } from '../models/course';
import { ILearningTrackSectionDetail } from '../models/learningTrack';

export function getOverallLearningTrackProgress(
  learningTrackSections: ILearningTrackSectionDetail[],
) {
  const courses = learningTrackSections.map((lts) => lts.courses).flat();

  return getAveragePercentageFromEnrolledCourses(courses);
}

export function getOverallLearningTrackSectionProgress(
  courses: Partial<ICourseDetail<string>>[],
) {
  return getAveragePercentageFromEnrolledCourses(courses);
}

function getAveragePercentageFromEnrolledCourses(
  courses: Partial<ICourse<string>>[],
) {
  const courseLength = courses.length;
  const enrolledCourses = courses
    .filter((it) => it.userEnrolledCourse?.length)
    .map((it) => it.userEnrolledCourse[0]);
  if (!enrolledCourses?.length) return 0;

  const sum = enrolledCourses
    .map((it) => it.percentage)
    .reduce((prev, current) => prev + current, 0);
  const percent = Math.ceil(sum / courseLength);
  return percent > 100 ? 100 : percent;
}
