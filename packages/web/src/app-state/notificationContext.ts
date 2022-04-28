import { createContext } from 'react';

interface INotificationContext {
  notificationCount: number;
  setNotificationCount: (count: number) => void;
}

export const NotificationContext =
  createContext<INotificationContext | undefined>(undefined);
