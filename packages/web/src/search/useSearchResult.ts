import { useEffect, useState } from 'react';
import API_PATHS from '../constants/apiPaths';
import usePagination from '../hooks/usePagination';
import { centralHttp } from '../http';
import { CourseLanguage } from '../models/course';
import IPaginationParams from '../models/IPaginationParams';
import { getErrorMessages } from '../utils/error';
import useSearchResultFilters from './useSearchResultFilters';

interface IUseSearchResult {
  itemsPerPage?: number;
}

export default function useSearchResult({
  itemsPerPage = 12,
}: IUseSearchResult) {
  const {
    term,
    type,
    courseCategory,
    lineOfLearning,
    myCourse,
    myLearningTrack,
    durationStart,
    durationEnd,
    language,
    hasCertificate,
    assignedCourse,
    requiredCourse,
    assignedLearningTrack,
  } = useSearchResultFilters();
  const [results, setResults] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [totalResult, setTotalResult] = useState(0);
  const [pagination, setPagination] = useState<IPaginationParams>(null);
  const { page, perPage } = usePagination({ defaultPerPage: 12 });
  const pageLimit = perPage || itemsPerPage;

  async function search() {
    setErrors([]);
    setLoading(true);
    try {
      const { data } = await centralHttp.get(API_PATHS.SEARCH, {
        params: {
          language: language || CourseLanguage.ALL,
          durationStart,
          durationEnd,
          myCourse,
          myLearningTrack,
          courseCategory,
          lineOfLearning,
          term,
          type,
          hasCertificate,
          page,
          perPage: pageLimit,
          assignmentType: assignedCourse
            ? 'optional'
            : requiredCourse
            ? 'required'
            : undefined,
          learningTrackAssignmentType: assignedLearningTrack
            ? 'optional'
            : undefined,
        },
      });
      setResults(data.data);
      setPagination(data.pagination);

      const allTotal = Object.keys(data.data).reduce((p, c) => {
        return p + (data.data?.[c].count || 0);
      }, 0);
      setTotalResult(allTotal);
    } catch (error) {
      const messages = getErrorMessages(error);
      setErrors(messages);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    search();
  }, [
    term,
    type,
    myCourse,
    myLearningTrack,
    durationStart,
    durationEnd,
    language,
    hasCertificate,
    courseCategory,
    lineOfLearning,
    page,
    perPage,
    assignedCourse,
    requiredCourse,
    assignedLearningTrack,
  ]);

  return { loading, errors, results, search, totalResult, pagination };
}
