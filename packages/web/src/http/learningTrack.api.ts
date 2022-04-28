import { centralHttp as http } from './index';
import API_PATHS from '../constants/apiPaths';
import {
  ILearningTrack,
  UserEnrolledLearningTrackRaw,
  UserEnrolledLearningTrackStatus,
} from '../models/learningTrack';
import { stringifyUrl } from 'query-string';
import { BaseResponseDto } from '../models/BaseResponse.dto';

const LearningTrackApi = {
  getLearningTracks: async (queryOptions = {}): Promise<any> => {
    const response = await http.get(API_PATHS.LEARNING_TRACKS, {
      params: queryOptions,
    });
    return response;
  },
  createLearningTrack: async (learningTrack: ILearningTrack): Promise<any> => {
    const response = await http.post(API_PATHS.LEARNING_TRACKS, learningTrack);
    return response.data.data;
  },
  deleteLearningTracks: async (ids: string[]): Promise<any> => {
    const response = await http.delete(API_PATHS.LEARNING_TRACKS, {
      data: { ids },
    });
    return response.data.data;
  },
  async getAllUserEnrolledLearningTracks(
    page?: number,
    perPage?: number,
    topicId?: string,
    learningWayId?: string,
    status?: UserEnrolledLearningTrackStatus,
    orderBy?: string,
  ) {
    const url = stringifyUrl({
      url: API_PATHS.ENROLLED_LEARNING_TRACKS,
      query: {
        page,
        perPage,
        topicId,
        learningWayId,
        status,
        orderBy,
      },
    });
    const { data } = await http.get<
      BaseResponseDto<UserEnrolledLearningTrackRaw[]>
    >(url);
    return data;
  },
  async getAllUserEnrolledLearningTrackStatuses(
    topicId?: string,
    learningWayId?: string,
  ) {
    const url = stringifyUrl({
      url: API_PATHS.ENROLLED_LEARNING_TRACK_STATUSES,
      query: {
        topicId,
        learningWayId,
      },
    });
    const { data } = await http.get<
      BaseResponseDto<Record<UserEnrolledLearningTrackStatus, number>>
    >(url);
    return data?.data;
  },

  async addArchiveLearningTrack(learningTrackId: string) {
    const { data } = await http.post(API_PATHS.USER_ARCHRIVE_LEARNING_TRACK, {
      learningTrackId,
    });
    return data?.data;
  },

  async removeArchiveLearningTrack(learningTrackId: string) {
    await http.delete(API_PATHS.USER_ARCHRIVE_LEARNING_TRACK, {
      data: {
        learningTrackId,
      },
    });
  },

  async checkCertificates(ids: string[]) {
    const { data } = await http.post<
      BaseResponseDto<{ [key: string]: boolean }>
    >(API_PATHS.LEARNING_TRACK_HAS_CERTIFICATE, {
      ids,
    });
    return data?.data;
  },
};

export default LearningTrackApi;
