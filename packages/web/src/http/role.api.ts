import { centralHttp as http } from './index';
import API_PATHS from '../constants/apiPaths';
import { Role } from '../models/role';

const RoleApi = {
  getRoles: async (): Promise<Role[]> => {
    const response = await http.get(API_PATHS.ROLES);
    return response.data.data;
  },
  updateUserRole: (userId: string, roleId: string) => {
    return http.put(API_PATHS.ADMIN_USER_ROLE, { userId, roleId });
  },
};

export default RoleApi;
