import { uniq } from 'lodash';
import { CourseSubCategoryKey, ICourseOutlineDetail } from '../models/course';

function getCourseOutlineKey(courseOutline: ICourseOutlineDetail) {
  return `${courseOutline.courseId}-${courseOutline.part}`;
}

export function getOverallCourseProgress(
  courseOutlines: ICourseOutlineDetail[],
) {
  // take into consideration that some courses have multiple outlines with the same part
  // eg. Learning events with F2F and Virtual counterparts

  // as well as different outlines from different courses, as this will also be used
  // to calculate the overall progress for learning tracks
  const totalOutlinesLength = uniq(
    courseOutlines.map(getCourseOutlineKey),
  ).length;

  if (totalOutlinesLength === 0) return 0;

  // get max value for each part
  const partialPercentage: { [part: string]: number } = {};
  for (const outline of courseOutlines) {
    for (const progress of outline.userCourseOutlineProgress) {
      partialPercentage[getCourseOutlineKey(outline)] = Math.max(
        partialPercentage[getCourseOutlineKey(outline)] || 0,
        progress.percentage,
      );
    }
  }

  const totalPercentage = Object.values(partialPercentage).reduce(
    (acc, curr) => acc + curr,
    0,
  );

  let overallProgress = totalPercentage / totalOutlinesLength;
  if (overallProgress > 100) overallProgress = 100;

  return overallProgress > 99 && overallProgress <= 100
    ? Math.floor(overallProgress)
    : Math.ceil(overallProgress);
}

export function getCurrentCourseOutline(
  courseOutlines: ICourseOutlineDetail[],
) {
  if (!courseOutlines.length) {
    return null;
  }

  if (
    courseOutlines[0].category.key === CourseSubCategoryKey.DOCUMENT ||
    courseOutlines[0].category.key === CourseSubCategoryKey.LINK ||
    courseOutlines[0].category.key === CourseSubCategoryKey.VIDEO
  ) {
    return null;
  }

  const overallCourseProgress = getOverallCourseProgress(courseOutlines);

  // All done
  if (overallCourseProgress >= 100) {
    return null;
  }

  // Not started
  if (overallCourseProgress <= 0) {
    return { id: courseOutlines[0].id, text: `01 ${courseOutlines[0].title}` };
  }

  // Has inprogress. Select first in progress item.
  const inProgressCourseOutline = courseOutlines.find(
    (co) =>
      co.userCourseOutlineProgress[0]?.percentage > 0 &&
      co.userCourseOutlineProgress[0]?.percentage < 100,
  );

  if (inProgressCourseOutline) {
    return {
      id: inProgressCourseOutline.id,
      text: `${(
        courseOutlines.findIndex((co) => co.id === inProgressCourseOutline.id) +
        1
      ).toLocaleString(undefined, {
        minimumIntegerDigits: 2,
      })} ${inProgressCourseOutline.title}`,
    };
  }

  // Has mixture of completed and not started. Find first non-started outline
  const nextUpCourseOutline = courseOutlines.find(
    (co) =>
      co.userCourseOutlineProgress[0]?.percentage < 0 ||
      co.userCourseOutlineProgress.length === 0,
  );

  if (nextUpCourseOutline) {
    return {
      id: nextUpCourseOutline.id,
      text: `Next up: ${nextUpCourseOutline.title}`,
    };
  }

  return null;
}
