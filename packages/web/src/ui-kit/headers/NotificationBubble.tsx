import { useContext } from 'react';
import { NotificationContext } from '../../app-state/notificationContext';

export const NotificationBubble: React.FC<any> = () => {
  const { notificationCount: count } = useContext(NotificationContext);

  return (
    count > 0 && (
      <div className="absolute top-4 right-24.5 h-1.5 w-1.5 rounded-full bg-red-200 lg:top-1 lg:left-14"></div>
    )
  );
};
