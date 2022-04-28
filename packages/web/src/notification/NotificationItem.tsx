import { useLocaleText } from '../i18n/useLocaleText';
import useTranslation from '../i18n/useTranslation';
import { LanguageCode } from '../models/language';
import { IUserNotification } from '../models/notification';
import {
  getNotificationCategoryIcon,
  getNotificationTime,
} from './useNotification';

interface INotificationItemProps {
  id?: IUserNotification['id'];
  onMarkRead?: (id: string) => void;
  isRead?: boolean;
  categoryKey: IUserNotification['notification']['category']['key'];
  content: IUserNotification['notification']['content'];
  createdAt: IUserNotification['createdAt'];
  locale: LanguageCode;
}

export const NotificationItem = ({
  categoryKey,
  content,
  createdAt,
  isRead = false,
  onMarkRead,
  id,
  locale,
}: INotificationItemProps) => {
  const { t } = useTranslation();

  return (
    <div
      className="m-1 flex cursor-pointer items-center rounded-md p-1 text-caption text-gray-600 hover:bg-gray-200"
      onClick={() => id && onMarkRead?.(id)}
    >
      <div className="relative p-2">
        {getNotificationCategoryIcon(categoryKey)}
        {isRead === false && (
          <div className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-red-200"></div>
        )}
      </div>
      <div>
        <div
          className="p-2 pb-1 text-caption text-gray-650"
          dangerouslySetInnerHTML={{
            __html:
              locale === LanguageCode.TH
                ? content.nameTh || content.nameEn
                : content.nameEn,
          }}
        ></div>
        <span className="text-gray-450 p-2 text-footnote">
          {getNotificationTime(createdAt, locale, t)}
        </span>
      </div>
    </div>
  );
};
