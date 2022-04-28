import { centralHttp as http } from './index';
import API_PATHS from '../constants/apiPaths';

const OrganizationApi = {
  getOrganizations: async (): Promise<any> => {
    const response = await http.get(API_PATHS.ORGANIZATIONS);
    return response.data.data;
  },
  uploadUserList: async (
    organizationId: string,
    fileName: string,
    key: string,
    uploadType: string,
  ): Promise<any> => {
    try {
      const response = await http.post(
        API_PATHS.ORGANIZATION_BULK_UPLOAD_USERS.replace(':id', organizationId),
        {
          fileName,
          key,
          uploadType,
        },
      );
      return response.data.data;
    } catch (error) {
      throw error.response;
    }
  },
  getUploadUserHistory: async (
    organizationId: string,
    page: number,
    perPage: number,
  ): Promise<any> => {
    const response = await http.get(
      API_PATHS.ORGANIZATION_BULK_UPLOAD_USERS.replace(':id', organizationId),
      {
        params: { page, perPage },
      },
    );
    return response.data.data;
  },
};

export default OrganizationApi;
