import { centralHttp as http } from './index';
import API_PATHS from '../constants/apiPaths';
import { LearningWay } from '../models/learning-way';

const LearningWayApi = {
  getLearningWayTree: async (queryOptions = {}): Promise<any> => {
    const response = await http.get(API_PATHS.LEARNING_WAYS_TREE, {
      params: queryOptions,
    });
    return response.data;
  },
  getLearningWayById: async (id: string, fetchSubLearningWays = false) => {
    const response = await http.get(
      `${API_PATHS.LEARNING_WAYS}/${id}${
        fetchSubLearningWays ? `?related=sublearningways` : ''
      }`,
    );
    return response.data.data as LearningWay;
  },
};

export default LearningWayApi;
