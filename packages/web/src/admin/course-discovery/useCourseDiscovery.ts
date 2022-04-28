import { useState } from 'react';
import API_PATHS from '../../constants/apiPaths';
import { centralHttp } from '../../http';
import { BaseResponseDto } from '../../models/BaseResponse.dto';
import {
  ICourseDiscovery,
  ICourseDiscoveryList,
} from '../../models/course-discovery';

export const useCourseDiscovery = () => {
  const [highlightedCourses, setHighlightedCourses] =
    useState<ICourseDiscovery[] | null | undefined>(undefined);
  const [popularCourses, setPopularCourses] =
    useState<ICourseDiscovery[] | null | undefined>(undefined);
  const [newReleases, setNewReleases] =
    useState<ICourseDiscovery[] | null | undefined>(undefined);

  async function fetchCourseDiscovery() {
    try {
      const res = await centralHttp.get<BaseResponseDto<ICourseDiscoveryList>>(
        API_PATHS.COURSE_DISCOVERY,
      );

      setHighlightedCourses(res.data.data.highlights);
      setPopularCourses(res.data.data.popular);
      setNewReleases(res.data.data.newReleases);
    } catch (err) {
      setHighlightedCourses(null);
      setPopularCourses(null);
      setNewReleases(null);
    }
  }

  return {
    highlightedCourses,
    setHighlightedCourses,
    popularCourses,
    setPopularCourses,
    newReleases,
    setNewReleases,
    fetchCourseDiscovery,
  };
};
