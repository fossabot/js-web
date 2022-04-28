import { centralHttp as http } from './index';
import API_PATHS from '../constants/apiPaths';
import { Topic } from '../models/topic';

const TopicApi = {
  getTopicTree: async (queryOptions = {}): Promise<any> => {
    const response = await http.get(API_PATHS.TOPICS_TREE, {
      params: queryOptions,
    });
    return response.data;
  },
  getTopicById: async (id: string, fetchSubTopics = false) => {
    const response = await http.get(
      `${API_PATHS.TOPICS}/${id}${fetchSubTopics ? `?related=subtopics` : ''}`,
    );
    return response.data.data as Topic;
  },
};

export default TopicApi;
