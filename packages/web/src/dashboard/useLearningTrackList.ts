import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  UserEnrolledLearningTrackRaw,
  UserEnrolledLearningTrackStatus,
} from '../models/learningTrack';
import LearningTrackApi from '../http/learningTrack.api';
import { stringifyUrl } from 'query-string';

const PER_PAGE = 10;

function useLearningTrackList() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [totalLearningTracks, setTotalLearningTracks] = useState(0);
  const [isEnded, setIsEnded] = useState(false);
  const [loadingLearningTracks, setLoadingLearningTracks] = useState(false);
  const [loadingStatuses, setLoadingStatuses] = useState(false);
  const [learningTracks, setLearningTracks] = useState<
    UserEnrolledLearningTrackRaw[]
  >([]);
  const [statuses, setStatuses] = useState<
    Record<UserEnrolledLearningTrackStatus, number>
  >({
    [UserEnrolledLearningTrackStatus.ENROLLED]: 0,
    [UserEnrolledLearningTrackStatus.IN_PROGRESS]: 0,
    [UserEnrolledLearningTrackStatus.COMPLETED]: 0,
    [UserEnrolledLearningTrackStatus.ARCHIVED]: 0,
  });
  const topicId = router.query.topicId as string;
  const learningWayId = router.query.learningWayId as string;
  const orderBy = router.query.orderBy as string;
  const currentStatus =
    (router.query.status as UserEnrolledLearningTrackStatus) ||
    UserEnrolledLearningTrackStatus.ENROLLED;

  async function fetchLearningTracks(page = 1) {
    setPage(page);

    if (loadingLearningTracks) return;

    setLoadingLearningTracks(true);
    const result = await LearningTrackApi.getAllUserEnrolledLearningTracks(
      page,
      PER_PAGE,
      topicId,
      learningWayId,
      currentStatus,
      orderBy,
    );
    let newLearningTracks = null;
    if (result.data.length) {
      const dict = await LearningTrackApi.checkCertificates(
        result.data.map((it) => it.id),
      );
      result.data.forEach((it) => (it.hasCertificate = dict[it.id] || false));
    }
    if (page <= 1) {
      newLearningTracks = result.data;
    } else {
      newLearningTracks = [...learningTracks, ...result.data];
    }
    setLearningTracks(newLearningTracks);
    setIsEnded(page >= result.pagination.totalPages);
    setTotalLearningTracks(result.pagination.total);
    setLoadingLearningTracks(false);
  }

  async function reloadLearningTracks() {
    setPage(1);
    fetchLearningTracks(1);
  }

  async function fetchLearningTrackStatuses() {
    if (loadingStatuses) return;

    setLoadingStatuses(true);
    const result =
      await LearningTrackApi.getAllUserEnrolledLearningTrackStatuses(
        topicId,
        learningWayId,
      );
    setStatuses(result);
    setLoadingStatuses(false);
  }

  function fetchMoreLearningTracks() {
    if (!isEnded) {
      fetchLearningTracks(page + 1);
    }
  }

  function setCurrentStatus(status: UserEnrolledLearningTrackStatus) {
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
    fetchLearningTracks(1);
  }, [topicId, learningWayId, currentStatus, orderBy]);

  useEffect(() => {
    fetchLearningTrackStatuses();
  }, [topicId, learningWayId]);

  return {
    learningTracks,
    statuses,
    currentStatus,
    setCurrentStatus,
    reloadLearningTracks,
    fetchMoreLearningTracks,
    fetchLearningTrackStatuses,
    loadingLearningTracks,
    loadingStatuses,
    isEnded,
    totalLearningTracks,
  };
}

export default useLearningTrackList;
