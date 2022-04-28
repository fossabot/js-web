import { useState } from 'react';
import { useCourseDiscovery } from '../admin/course-discovery/useCourseDiscovery';
import API_PATHS from '../constants/apiPaths';
import { centralHttp } from '../http';
import { BaseResponseDto } from '../models/BaseResponse.dto';
import { ICourse } from '../models/course';
import { PromoBanner } from '../models/promoBanner';
import { CourseDiscoveryType } from '../models/course-discovery';
import { UserCourseStat } from '../models/userCourseStat';

export function useDashboardHomePage() {
  const [summaryResult, setSummaryResult] = useState<UserCourseStat>();
  const [latestCourse, setLatestCourse] = useState<ICourse>();
  const [promoBanners, setPromoBanners] = useState<PromoBanner[]>();
  const [discoveryTab, setDiscoveryTab] = useState<CourseDiscoveryType>(
    CourseDiscoveryType.HIGHLIGHT,
  );

  const {
    fetchCourseDiscovery,
    highlightedCourses,
    newReleases,
    popularCourses,
  } = useCourseDiscovery();
  const [showMoreDiscovery, setShowMoreDiscovery] = useState(false);

  async function fetchCourseSummary() {
    const { data } = await centralHttp.get<BaseResponseDto<UserCourseStat>>(
      API_PATHS.ENROLLED_COURSES_STATUSES,
    );
    setSummaryResult(data.data);
  }

  async function fetchLatestInProgressCourse() {
    try {
      const { data } = await centralHttp.get<BaseResponseDto<ICourse>>(
        API_PATHS.COURSE_LATEST_IN_PROGRESS,
      );
      setLatestCourse(data.data);
    } catch (error) {
      setLatestCourse(null);
    }
  }

  async function fetchPromoBanners() {
    const { data } = await centralHttp.get<BaseResponseDto<PromoBanner[]>>(
      API_PATHS.PROMO_BANNER,
    );
    setPromoBanners(data.data);
  }
  const discoveryCourses =
    discoveryTab === CourseDiscoveryType.HIGHLIGHT
      ? highlightedCourses
      : discoveryTab === CourseDiscoveryType.POPULAR
      ? popularCourses
      : newReleases;

  return {
    fetchCourseSummary,
    fetchLatestInProgressCourse,
    fetchPromoBanners,
    summaryResult,
    latestCourse,
    promoBanners,
    fetchCourseDiscovery,
    highlightedCourses,
    newReleases,
    popularCourses,
    discoveryCourses,
    discoveryTab,
    setDiscoveryTab,
    showMoreDiscovery,
    setShowMoreDiscovery,
  };
}
