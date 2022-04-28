import { centralHttp as http } from './index';
import API_PATHS from '../constants/apiPaths';
import LoginSetting from '../models/login.setting';
import PasswordSetting from '../models/password.setting';

const AdminSettingApi = {
  uploadUserList: async (
    fileName: string,
    key: string,
    uploadType: string,
  ): Promise<any> => {
    try {
      const response = await http.post(API_PATHS.ADMIN_UPLOAD_USER, {
        fileName,
        key,
        uploadType,
      });
      return response.data.data;
    } catch (error) {
      throw error.response;
    }
  },
  getLoginSetting: async (): Promise<any> => {
    const response = await http.get(API_PATHS.ADMIN_SETTINGS_LOGIN);
    return response.data.data;
  },
  getUploadUserHistory: async (page: number, perPage: number): Promise<any> => {
    const response = await http.get(API_PATHS.ADMIN_UPLOAD_USER, {
      params: { page, perPage },
    });
    return response.data.data;
  },
  updateLoginSetting: async (id: string, data: LoginSetting): Promise<any> => {
    return http.put(`${API_PATHS.ADMIN_SETTINGS_LOGIN}/${id}`, data);
  },
  getPasswordSetting: async (): Promise<any> => {
    const response = await http.get(API_PATHS.ADMIN_SETTINGS_PASSWORD);
    return response.data.data;
  },
  updatePasswordSetting: async (
    id: string,
    data: PasswordSetting,
  ): Promise<any> => {
    return http.put(`${API_PATHS.ADMIN_SETTINGS_PASSWORD}/${id}`, data);
  },
  activateUsers: async (userIds: string[]) => {
    return http.put(`${API_PATHS.ADMIN_ACTIVATE_USERS}`, { ids: userIds });
  },
  deactivateUsers: async (userIds: string[]) => {
    return http.put(`${API_PATHS.ADMIN_DEACTIVATE_USERS}`, { ids: userIds });
  },
};

export default AdminSettingApi;
