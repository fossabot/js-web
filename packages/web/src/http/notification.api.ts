import API_PATHS from '../constants/apiPaths';
import { notificationHttp as http } from './index';
import { IUserNotification } from '../models/notification';
import IPaginationParams from '../models/IPaginationParams';

interface UserNotificationList {
  data: Array<IUserNotification>;
  pagination: IPaginationParams;
}

const NotficationApi = {
  getUserNotifications: async (
    queryOptions = {},
  ): Promise<UserNotificationList> => {
    const response = await http.get(`${API_PATHS.USER_NOTIFICATION}`, {
      params: queryOptions,
    });
    return response.data;
  },
  getUserUnreadNotificationCount: async () => {
    const response = await http.get(
      `${API_PATHS.USER_UNREAD_NOTIFICATION_COUNT}`,
    );
    return response.data;
  },
  markAllNotificationAsRead: async () => {
    const response = await http.patch(
      `${API_PATHS.USER_NOTIFICATION_MARK_ALL_READ}`,
    );
    return response.data;
  },
  markNotificationAsRead: async (id: string) => {
    const response = await http.patch(
      `${API_PATHS.USER_NOTIFICATION_MARK_READ}/${id}`,
    );
    return response.data;
  },
};

export default NotficationApi;
