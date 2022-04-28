import { useEffect, useState } from 'react';

import { centralHttp } from '../http';
import API_PATHS from '../constants/apiPaths';
import { getErrorMessages } from '../utils/error';
import usePagination from '../hooks/usePagination';
import { ILearningTrack } from '../models/learningTrack';
import IPaginationParams from '../models/IPaginationParams';
import useLearningTrackFilters from './useLearningTrackFilters';
import { UserAssignedLearningTrackType } from '../models/userAssignedLearningTrack';

interface IUseLearningTrackList {
  itemsPerPage?: number;
}

export default function useLearningTrackList({
  itemsPerPage = 12,
}: IUseLearningTrackList) {
  const { topicId, category, hasCertificate, assigned } =
    useLearningTrackFilters();
  const [learningTracks, setLearningTracks] = useState<
    ILearningTrack<string>[]
  >([]);
  const [pagination, setPagination] = useState<IPaginationParams>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errors, setErrors] = useState<string[]>([]);
  const { page, perPage } = usePagination({ defaultPerPage: itemsPerPage });

  async function fetchLearningTracks() {
    setLoading(true);

    try {
      const { data } = await centralHttp.get(API_PATHS.LEARNING_TRACKS_SEARCH, {
        params: {
          topicId,
          category,
          hasCertificate: hasCertificate === '1' || undefined,
          page,
          perPage,
          assignmentType:
            assigned === '1'
              ? UserAssignedLearningTrackType.Optional
              : undefined,
        },
      });
      const { data: learningTracksArray, pagination } = data;

      setLearningTracks(learningTracksArray);
      setPagination(pagination);
    } catch (error) {
      const messages = getErrorMessages(error);
      setErrors(messages);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLearningTracks();
  }, [topicId, category, hasCertificate, page, perPage, assigned]);

  return {
    loading,
    errors,
    topicId,
    learningTracks,
    pagination,
    fetchLearningTracks,
  };
}
