import API_PATHS from '../../constants/apiPaths';
import useList from '../../hooks/useList';
import { notificationHttp } from '../../http';
import { EmailNotificationListItem } from '../../models/emailNotification';
import { captureError } from '../../utils/error-routing';

export function useEmailNotificationListPage() {
  const emailNotifications = useList<EmailNotificationListItem>((options) => {
    return notificationHttp.get(API_PATHS.EMAIL_NOTIFICATION, {
      params: options,
    });
  });

  async function handleActiveChange(
    notification: EmailNotificationListItem,
    isActive: boolean,
  ) {
    const { id } = notification;
    try {
      await notificationHttp.patch(
        API_PATHS.UPDATE_EMAIL_NOTIFICATION_STATUS.replace(':id', id),
        {
          isActive,
        },
      );
      emailNotifications.fetchData();
    } catch (err) {
      captureError(err);
    }
  }

  return {
    emailNotifications,
    handleActiveChange,
  };
}
