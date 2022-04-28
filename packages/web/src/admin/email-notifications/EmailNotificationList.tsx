import Link from 'next/link';
import { FC, useMemo } from 'react';
import WEB_PATHS from '../../constants/webPaths';
import useTranslation from '../../i18n/useTranslation';
import { EmailNotificationListItem } from '../../models/emailNotification';
import {
  DataTable,
  DataTableColumn,
  DataTableColumnSize,
  DataTableHeadColumn,
  DataTableHeadRow,
  DataTableRow,
  DataTableSelect,
} from '../../ui-kit/DataTable';
import { PencilThick } from '../../ui-kit/icons';

export interface IEmailNotificationList {
  emailNotifications: EmailNotificationListItem[];
  onStatusChange: (
    notification: EmailNotificationListItem,
    isActive: boolean,
  ) => void;
}

export const EmailNotificationList: FC<IEmailNotificationList> = (props) => {
  const { emailNotifications, onStatusChange } = props;
  const { t } = useTranslation();
  const actionOptions = useMemo(
    () => [
      {
        label: t('emailNotificationListPage.active'),
        value: true,
      },
      {
        label: t('emailNotificationListPage.inactive'),
        value: false,
      },
    ],
    [],
  );

  return (
    <>
      <DataTable>
        <thead>
          <DataTableHeadRow>
            <DataTableHeadColumn
              orderBy="subject"
              size={DataTableColumnSize.MAX}
            >
              {t('emailNotificationListPage.emailSubject')}
            </DataTableHeadColumn>
            <DataTableHeadColumn orderBy="triggerType">
              {t('emailNotificationListPage.trigger')}
            </DataTableHeadColumn>
            <DataTableHeadColumn orderBy="category">
              {t('emailNotificationListPage.category')}
            </DataTableHeadColumn>
            <DataTableHeadColumn size={DataTableColumnSize.SHORTER}>
              {t('emailNotificationListPage.status')}
            </DataTableHeadColumn>
            <DataTableHeadColumn size={DataTableColumnSize.SHORTER}>
              {t('emailNotificationListPage.edit')}
            </DataTableHeadColumn>
          </DataTableHeadRow>
        </thead>
        <tbody>
          {emailNotifications.map((notification) => (
            <DataTableRow key={notification.id}>
              <DataTableColumn>{notification.title}</DataTableColumn>
              <DataTableColumn>{notification.triggerText}</DataTableColumn>
              <DataTableColumn>{notification.categoryName}</DataTableColumn>
              <DataTableColumn>
                <DataTableSelect
                  options={actionOptions}
                  value={
                    actionOptions.find(
                      (a) => a.value === notification.isActive,
                    ) || actionOptions[0]
                  }
                  onChange={(value) => onStatusChange(notification, value)}
                />
              </DataTableColumn>
              <DataTableColumn>
                <Link
                  href={`${WEB_PATHS.EMAIL_NOTIFICATIONS}/${notification.id}`}
                >
                  <a className="flex items-center text-gray-650">
                    <span className="font-bold">
                      {t('emailNotificationListPage.edit')}
                    </span>
                    <PencilThick className="ml-2.5 h-4 w-4" />
                  </a>
                </Link>
              </DataTableColumn>
            </DataTableRow>
          ))}
        </tbody>
      </DataTable>
    </>
  );
};
