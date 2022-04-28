import { AxiosResponse } from 'axios';
import { stringifyUrl } from 'query-string';
import API_PATHS from '../constants/apiPaths';
import { FetchOptions } from '../hooks/useList';
import { BaseResponseDto } from '../models/BaseResponse.dto';
import {
  CourseCategoryKey,
  CourseLanguage,
  CourseSubCategoryKey,
  ICourse,
  ICourseOutlineBundle,
  ICourseSessionBooking,
  PartialCourseOutlineBundle,
  UserEnrolledCourseRaw,
  UserEnrolledCourseStatuses,
} from '../models/course';
import IPaginationParams from '../models/IPaginationParams';
import { Language } from '../models/language';
import { MediaExtended, VideoProgress } from '../models/media';
import { IScormProgress } from '../models/scorm';
import { UserAssignedCourseType } from '../models/userAssignedCourse';
import { centralHttp as http } from './index';

interface ICourseSearchOptions {
  id: string;
  type: string;
  language: string | CourseLanguage;
  categoryKey?: string | CourseCategoryKey;
  subCategoryKey?: string | CourseSubCategoryKey;
  durationStart?: number;
  durationEnd?: number;
  hasCertificate?: boolean;
  assignmentType?: UserAssignedCourseType;
  page?: number;
  perPage?: number;
}

export interface ICourseSearchResult {
  data: ICourse<string>[];
  pagination: IPaginationParams;
}

const CourseApi = {
  getProductMaster: async (queryOptions = {}): Promise<any> => {
    const response = await http.get(`${API_PATHS.COURSES}/product-master`, {
      params: queryOptions,
    });
    return response.data;
  },
  getCourses: async (queryOptions = {}): Promise<any> => {
    const response = await http.get(API_PATHS.COURSES, {
      params: queryOptions,
    });
    return response;
  },
  getLearningContent: async (id: string): Promise<any> => {
    const response = await http.get(
      API_PATHS.COURSE_LEARNING_CONTENT.replace(':id', id),
    );
    return response.data;
  },
  createCourse: async (course: ICourse): Promise<any> => {
    const response = await http.post(API_PATHS.COURSES, course);
    return response.data.data;
  },
  deleteCourses: async (ids: string[]): Promise<any> => {
    const response = await http.delete(API_PATHS.COURSES, { data: { ids } });
    return response.data.data;
  },
  searchCourses: async (
    queryOptions: ICourseSearchOptions,
  ): Promise<ICourseSearchResult> => {
    const response = await http.get(API_PATHS.COURSES_SEARCH, {
      params: queryOptions,
    });
    return response.data as ICourseSearchResult;
  },
  getScormProgress: async (id: string) => {
    const response = await http.get(
      API_PATHS.SCORM_PROGRESS.replace(':id', id),
    );
    return response.data.data;
  },
  updateScormProgress: async (id: string, progress: IScormProgress) => {
    await http.put(API_PATHS.SCORM_PROGRESS.replace(':id', id), progress);
  },
  generateScormToken: async (courseOutlineId: string) => {
    const response = await http.get(
      API_PATHS.SCORM_SIGNED_URL.replace(':courseOutlineId', courseOutlineId),
    );
    return response.data;
  },
  getCourseSessionBooking: async (
    id: string,
  ): Promise<ICourseSessionBooking<Language>> => {
    const response = await http.get(
      API_PATHS.COURSE_SESSIONS_BOOKING.replace(':bookingId', id as string),
    );

    return response.data.data;
  },
  getCourseOutlineBundles: async (
    options?: FetchOptions,
  ): Promise<AxiosResponse<BaseResponseDto<PartialCourseOutlineBundle[]>>> => {
    return http.get(API_PATHS.COURSE_OUTLINE_BUNDLES.replace('/:id', ''), {
      params: options,
    });
  },
  createCourseOutlineBundle: async (
    name: string,
    courseOutlineIds: string[] = [],
  ): Promise<PartialCourseOutlineBundle> => {
    const response = await http.post(
      API_PATHS.COURSE_OUTLINE_BUNDLES.replace('/:id', ''),
      { name, courseOutlineIds },
    );

    return response.data.data;
  },
  updateCourseOutlineBundle: async (
    id: string,
    name: string,
    courseOutlineIds: string[] = [],
    isActive?: boolean,
  ): Promise<PartialCourseOutlineBundle> => {
    const response = await http.put(
      API_PATHS.COURSE_OUTLINE_BUNDLES.replace(':id', id),
      { name, courseOutlineIds, isActive },
    );

    return response.data.data;
  },
  getCourseOutlineBundleById: async (
    id: string,
  ): Promise<ICourseOutlineBundle<Language>> => {
    const response = await http.get(
      API_PATHS.COURSE_OUTLINE_BUNDLES.replace(':id', id),
    );

    return response.data.data;
  },
  deleteCourseOutlineBundleById: async (id: string) => {
    await http.delete(API_PATHS.COURSE_OUTLINE_BUNDLES.replace(':id', id));
  },
  getVideoProgress: async (courseId: string) => {
    const response = await http.get(
      API_PATHS.VIDEO_PROGRESS.replace(':id', courseId),
    );
    return response.data.data;
  },
  updateVideoProgress: async (
    courseOutlineId: string,
    mediaId: string,
    spentDuration: number,
  ) => {
    await http.put(API_PATHS.VIDEO_PROGRESS.replace(':id', courseOutlineId), {
      mediaId,
      spentDuration,
    });
  },
  async getAllVideos(id) {
    const { data } = await http.get<
      BaseResponseDto<{ videos: MediaExtended[]; progress: VideoProgress[] }>
    >(API_PATHS.COURSE_ALL_MEDIA.replace(':id', id));
    const { videos, progress } = data?.data;
    try {
      videos.forEach((video) => {
        const currentProgress = progress.find((p) => p.id === video.id);
        if (currentProgress) {
          video.spentDuration = currentProgress.spentDuration;
          video.percentage = currentProgress.percentage;
        }
      });
    } catch (error) {
      console.error(error);
    }
    return videos;
  },
  async getLastSeenVideo(id) {
    const { data } = await http.get<BaseResponseDto<MediaExtended>>(
      API_PATHS.COURSE_LAST_SEEN_VIDEO.replace(':id', id),
    );
    return data?.data;
  },
  async getAllUserEnrolledCourses(
    page?: number,
    perPage?: number,
    topicId?: string,
    learningWayId?: string,
    status?: keyof UserEnrolledCourseStatuses,
    orderBy?: string,
  ) {
    const url = stringifyUrl({
      url: API_PATHS.ENROLLED_COURSES,
      query: {
        page,
        perPage,
        topicId,
        learningWayId,
        status,
        orderBy,
      },
    });
    const { data } = await http.get<BaseResponseDto<UserEnrolledCourseRaw[]>>(
      url,
    );
    return data;
  },
  async getAllUserEnrolledCourseStatuses(
    topicId?: string,
    learningWayId?: string,
  ) {
    const url = stringifyUrl({
      url: API_PATHS.ENROLLED_COURSES_STATUSES,
      query: {
        topicId,
        learningWayId,
      },
    });
    const { data } = await http.get<
      BaseResponseDto<UserEnrolledCourseStatuses>
    >(url);
    return data?.data;
  },

  async addArchiveCourse(courseId: string) {
    const { data } = await http.post(API_PATHS.USER_ARCHRIVE_COURSES, {
      courseId,
    });
    return data?.data;
  },

  async removeArchiveCourse(courseId: string) {
    await http.delete(API_PATHS.USER_ARCHRIVE_COURSES, {
      data: {
        courseId,
      },
    });
  },

  async checkCertificates(ids: string[]) {
    const { data } = await http.post<
      BaseResponseDto<{ [key: string]: boolean }>
    >(API_PATHS.COURSE_HAS_CERTIFICATE, {
      ids,
    });
    return data?.data;
  },
};

export default CourseApi;
