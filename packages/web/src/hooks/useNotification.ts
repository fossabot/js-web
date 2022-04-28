import { useCallback, useEffect, useState } from 'react';
import config from '../config';
import { ITokenObject } from '../models/auth';
import { MessageType } from '../service-workers/constants';
import { MessageEventData } from '../service-workers/interfaces';
import NotificationApi from '../http/notification.api';

interface IUseNotification {
  token: ITokenObject;
}

export const useNotification = ({ token }: IUseNotification) => {
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    fetchUnreadNotificationsCount();
  }, []);

  const fetchUnreadNotificationsCount = async () => {
    try {
      const result = await NotificationApi.getUserUnreadNotificationCount();
      setNotificationCount(result);
    } catch (e) {
      console.log(e);
    }
  };

  const notificationHandler = useCallback(() => {
    setNotificationCount(notificationCount + 1);
  }, [notificationCount]);

  const connectToSocketIo = useCallback(() => {
    if ('serviceWorker' in navigator && token) {
      navigator.serviceWorker.ready.then((registration) => {
        const message: MessageEventData = {
          url: config.NOTIFICATION_URL,
          type: MessageType.CONNECT,
          auth: token.jwtToken,
          userId: token.user.id,
        };

        registration.active.postMessage(message);
      });

      navigator.serviceWorker.addEventListener('message', notificationHandler);
    }
  }, [notificationHandler, token]);

  useEffect(() => {
    connectToSocketIo();

    window.addEventListener('focus', connectToSocketIo);

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener(
          'message',
          notificationHandler,
        );
      }

      window.removeEventListener('focus', connectToSocketIo);
    };
  }, [token, notificationHandler, connectToSocketIo]);

  return { notificationCount, setNotificationCount };
};
