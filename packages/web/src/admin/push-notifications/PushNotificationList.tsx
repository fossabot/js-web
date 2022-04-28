import { FC, useMemo } from 'react';
import useTranslation from '../../i18n/useTranslation';
import { INotification } from '../../models/notification';
import {
  DataTable,
  DataTableAlignment,
  DataTableColumn,
  DataTableColumnSize,
  DataTableHeadColumn,
  DataTableHeadRow,
  DataTableRow,
  DataTableSelect,
} from '../../ui-kit/DataTable';
import { Eye } from '../../ui-kit/icons';

interface IPushNotificationList {
  pushNotifications: INotification[];
  onStatusChange: (id: string, status: boolean) => Promise<void>;
  onClickPreview: (announcement: INotification) => Promise<void>;
}

export const PushNotificationList: FC<IPushNotificationList> = ({
  pushNotifications,
  onStatusChange,
  onClickPreview,
}) => {
  const { t } = useTranslation();

  const actionOptions = useMemo(
    () => [
      {
        label: t('pushNotificationListPage.active'),
        value: true,
      },
      {
        label: t('pushNotificationListPage.inactive'),
        value: false,
      },
    ],
    [t],
  );

  return (
    <DataTable containerClassName="mt-6">
      <thead>
        <DataTableHeadRow>
          <DataTableHeadColumn orderBy="title" size={DataTableColumnSize.MAX}>
            {t('pushNotificationListPage.title')}
          </DataTableHeadColumn>
          <DataTableHeadColumn size={DataTableColumnSize.LONG}>
            {t('pushNotificationListPage.trigger')}
          </DataTableHeadColumn>
          <DataTableHeadColumn
            orderBy="category"
            size={DataTableColumnSize.LONGER}
          >
            {t('pushNotificationListPage.category')}
          </DataTableHeadColumn>
          <DataTableHeadColumn
            orderBy="isActive"
            size={DataTableColumnSize.SHORTER}
          >
            {t('systemAnnouncementListPage.status')}
          </DataTableHeadColumn>
          <DataTableHeadColumn
            size={DataTableColumnSize.SHORTER}
            align={DataTableAlignment.CENTER}
          >
            {t('pushNotificationListPage.preview')}
          </DataTableHeadColumn>
        </DataTableHeadRow>
      </thead>
      <tbody>
        {pushNotifications.map((pn) => (
          <DataTableRow key={pn.id}>
            <DataTableColumn>{pn.title}</DataTableColumn>
            <DataTableColumn className="text-gray-500">
              {pn.triggerType?.displayName}
            </DataTableColumn>
            <DataTableColumn>{pn.category.name}</DataTableColumn>
            <DataTableColumn>
              <DataTableSelect
                options={actionOptions}
                value={
                  actionOptions.find(
                    (option) => option.value === pn.isActive,
                  ) || actionOptions[1]
                }
                onChange={(value) => onStatusChange(pn.id, value)}
              />
            </DataTableColumn>
            <DataTableColumn>
              <div className="flex w-full items-center justify-center">
                <button className="w-min" onClick={() => onClickPreview(pn)}>
                  <Eye className="h-5 w-5 text-gray-650" />
                </button>
              </div>
            </DataTableColumn>
          </DataTableRow>
        ))}
      </tbody>
    </DataTable>
  );
};
