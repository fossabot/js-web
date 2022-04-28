import { centralHttp as http } from './index';
import API_PATHS from '../constants/apiPaths';

const TagApi = {
  getTags: async (queryOptions = {}): Promise<any> => {
    const response = await http.get(API_PATHS.TAGS, {
      params: queryOptions,
    });
    return response.data;
  },
};

export default TagApi;
