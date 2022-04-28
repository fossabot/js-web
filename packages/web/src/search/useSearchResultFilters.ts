import { useRouter } from 'next/router';
import { stringifyUrl } from 'query-string';

export default function useSearchReultFilters() {
  const router = useRouter();

  const language = router.query.language as string;
  const duration = router.query.duration as string;
  const myCourse = router.query.myCourse as string;
  const myLearningTrack = router.query.myLearningTrack as string;
  const term = router.query.term as string;
  const type = router.query.type as string;
  const courseCategory = router.query.courseCategory as string;
  const lineOfLearning = router.query.lineOfLearning as string;
  const hasCertificate = router.query.hasCertificate as string;
  const requiredCourse = router.query.requiredCourse as string;
  const assignedCourse = router.query.assignedCourse as string;
  const assignedLearningTrack = router.query.assignedLearningTrack as string;
  const durationStartStr = router.query.durationStart as string;
  const durationEndStr = router.query.durationEnd as string;

  const durationStart = !!durationStartStr
    ? parseInt(durationStartStr)
    : undefined;
  const durationEnd = !!durationEndStr ? parseInt(durationEndStr) : undefined;

  const hasActiveFilters =
    !!language ||
    !!duration ||
    !!hasCertificate ||
    !!myCourse ||
    !!myLearningTrack ||
    !!requiredCourse ||
    !!assignedCourse ||
    !!assignedLearningTrack;

  function reloadPage(query) {
    const newUrl = stringifyUrl({
      url: router.pathname,
      query: {
        ...router.query,
        ...query,
      },
    });

    router.push(newUrl, undefined, { scroll: false, shallow: true });
  }

  function handleClear() {
    const query = {
      durationStart: undefined,
      durationEnd: undefined,
      language: undefined,
      myCourse: undefined,
      myLearningTrack: undefined,
      hasCertificate: undefined,
      requiredCourse: undefined,
      assignedCourse: undefined,
      assignedLearningTrack: undefined,
    };

    reloadPage(query);
  }

  return {
    pathname: router.pathname,
    term,
    type,
    durationStart,
    durationEnd,
    language,
    duration,
    myCourse,
    courseCategory,
    lineOfLearning,
    hasCertificate,
    hasActiveFilters,
    myLearningTrack,
    handleClear,
    reloadPage,
    requiredCourse,
    assignedCourse,
    assignedLearningTrack,
  };
}
