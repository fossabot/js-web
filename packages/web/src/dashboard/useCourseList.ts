import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  UserEnrolledCourseRaw,
  UserEnrolledCourseStatuses,
} from '../models/course';
import CourseApi from '../http/course.api';
import { stringifyUrl } from 'query-string';
import { unstable_batchedUpdates } from 'react-dom';

const PER_PAGE = 15;

function useCourseList() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const [isEnded, setIsEnded] = useState(false);
  const [loadingCourses, setLoadingCourses] =
    useState<'initial' | 'more' | null>(null);
  const [loadingStatuses, setLoadingStatuses] = useState(false);
  const [courses, setCourses] = useState<UserEnrolledCourseRaw[]>([]);
  const [statuses, setStatuses] = useState<UserEnrolledCourseStatuses>({
    notStarted: 0,
    inProgress: 0,
    completed: 0,
    archived: 0,
  });
  const topicId = router.query.topicId as string;
  const learningWayId = router.query.learningWayId as string;
  const orderBy = router.query.orderBy as string;
  const currentStatus =
    (router.query.status as keyof UserEnrolledCourseStatuses) || 'notStarted';

  async function fetchCourses(page = 1) {
    setPage(page);

    if (loadingCourses !== null) return;

    setLoadingCourses(page === 1 ? 'initial' : 'more');
    const result = await CourseApi.getAllUserEnrolledCourses(
      page,
      PER_PAGE,
      topicId,
      learningWayId,
      currentStatus,
      orderBy,
    );

    if (result.data.length) {
      const dict = await CourseApi.checkCertificates(
        result.data.map((it) => it.id),
      );
      result.data.forEach((it) => (it.hasCertificate = dict[it.id] || false));
    }
    unstable_batchedUpdates(() => {
      setCourses((courses) =>
        page <= 1 ? result.data : [...courses, ...result.data],
      );
      setIsEnded(page >= result.pagination.totalPages);
      setTotalCourses(result.pagination.total);
      setLoadingCourses(null);
    });
  }

  async function reloadCourses() {
    setPage(1);
    fetchCourses(1);
  }

  async function fetchCourseStatuses() {
    if (loadingStatuses) return;

    setLoadingStatuses(true);
    const result = await CourseApi.getAllUserEnrolledCourseStatuses(
      topicId,
      learningWayId,
    );
    setStatuses(result);
    setLoadingStatuses(false);
  }

  function fetchMoreCourses() {
    if (!isEnded) {
      fetchCourses(page + 1);
    }
  }

  function setCurrentStatus(status: keyof UserEnrolledCourseStatuses) {
    const url = stringifyUrl({
      url: router.pathname,
      query: {
        ...router.query,
        topicId,
        learningWayId,
        status,
      },
    });
    router.push(url);
  }

  useEffect(() => {
    fetchCourses(1);
  }, [topicId, learningWayId, currentStatus, orderBy]);

  useEffect(() => {
    fetchCourseStatuses();
  }, [topicId, learningWayId]);

  return {
    courses,
    statuses,
    currentStatus,
    setCurrentStatus,
    reloadCourses,
    fetchMoreCourses,
    fetchCourseStatuses,
    loadingCourses,
    loadingStatuses,
    isEnded,
    totalCourses,
  };
}

export default useCourseList;
