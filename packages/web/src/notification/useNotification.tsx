import { differenceInMinutes, formatDistanceToNow, isToday } from 'date-fns';
import { useRouter } from 'next/router';
import { useContext, useState, ReactNode } from 'react';
import { NotificationContext } from '../app-state/notificationContext';
import usePagination from '../hooks/usePagination';
import useSearch from '../hooks/useSearch';
import useSort from '../hooks/useSort';
import NotificationApi from '../http/notification.api';
import IPaginationParams from '../models/IPaginationParams';
import {
  IUserNotification,
  NotificationCategoryKey,
} from '../models/notification';
import {
  Assignment,
  BellSolid,
  CertificateSolid,
  Info,
  OpenBook,
  Profile,
} from '../ui-kit/icons';
import { formatDateWithLocale } from '../utils/date';
import { captureError } from '../utils/error-routing';

interface INotificationPagination {
  page?: number;
  perPage?: number;
}

export default function useNotification(options?: INotificationPagination) {
  const [userNotifications, setUserNotifications] = useState<
    IUserNotification[]
  >([]);
  const [pagination, setPagination] =
    useState<IPaginationParams | undefined>(undefined);

  const router = useRouter();
  const { page, perPage } = usePagination(
    options && { defaultPage: options.page, defaultPerPage: options.perPage },
  );
  const { search, searchField } = useSearch();
  const { order, orderBy } = useSort();
  const [count, setCount] = useState(0);
  const [totalPages, setTotalPage] = useState(0);
  const { notificationCount, setNotificationCount } =
    useContext(NotificationContext);

  const fetchNotifications = async () => {
    try {
      const result = await NotificationApi.getUserNotifications({
        page,
        perPage,
        search,
        searchField,
        order,
        orderBy,
        ...router.query,
      });
      setUserNotifications(result.data);
      setPagination(result.pagination);
      setCount(result.pagination.total);
      setTotalPage(result.pagination.totalPages);
    } catch (e) {
      console.error(e);
      captureError(e);
    }
  };

  const fetchNotificationsOnScroll = async (page: number, perPage: number) => {
    try {
      const result = await NotificationApi.getUserNotifications({
        page,
        perPage,
      });
      setUserNotifications([...userNotifications, ...result.data]);
      setPagination(result.pagination);
    } catch (e) {
      console.error(e);
      captureError(e);
    }
  };

  const markAllRead = async () => {
    try {
      const result = await NotificationApi.markAllNotificationAsRead();
      setNotificationCount(0);
      await fetchNotifications(); //after updating notifications, fetch updated
    } catch (e) {
      console.error(e);
      captureError(e);
    }
  };

  const markRead = async (id: string) => {
    try {
      const result = await NotificationApi.markNotificationAsRead(id);
      setNotificationCount(notificationCount - 1);
      await fetchNotifications(); //after updating notifications, fetch updated
    } catch (e) {
      console.error(e);
      captureError(e);
    }
  };

  return {
    userNotifications,
    pagination,
    count,
    totalPages,
    fetchNotifications,
    markAllRead,
    markRead,
    page,
    perPage,
    fetchNotificationsOnScroll,
  };
}

const notificationCategoryIconMap: {
  [key in NotificationCategoryKey]: (props: any) => JSX.Element;
} = {
  [NotificationCategoryKey.ASSIGNMENT]: Assignment,
  [NotificationCategoryKey.REMINDER]: BellSolid,
  [NotificationCategoryKey.LEARNING_ACTIVITY]: OpenBook,
  [NotificationCategoryKey.CERTIFICATE]: CertificateSolid,
  [NotificationCategoryKey.SYSTEM_ANNOUNCEMENT]: Info,
  [NotificationCategoryKey.MEMBERSHIP]: Profile,
};

export const getNotificationCategoryIcon = (key: string): ReactNode => {
  // we have to use `includes` here as the category keys aren't grouped up
  const mapKey = Object.keys(notificationCategoryIconMap).find((mapKey) =>
    key.includes(mapKey),
  );
  const Icon = notificationCategoryIconMap[mapKey];
  if (Icon) return <Icon className="h-6 w-6" />;
  return null;
};

export const getNotificationTime = (date: string, locale: string, t) => {
  const interval = differenceInMinutes(new Date(), new Date(date));
  // check if interval is within last hour
  if (interval < 60) {
    return formatDistanceToNow(new Date(date)) + ` ${t('notification.ago')}`;
  }
  //check if time is within today
  if (isToday(new Date(date))) {
    return (
      `${t('notification.today')} ` +
      formatDateWithLocale(locale, new Date(date), 'H:mm', 'H:mm')
    );
  }
  return formatDateWithLocale(
    locale,
    new Date(date),
    'd LLL yy, H:mm',
    'd LLL yy, H:mm',
  ); //3 Apr 22, 12:53 format
};
