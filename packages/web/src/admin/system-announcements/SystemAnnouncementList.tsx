import { FC, useMemo } from 'react';
import {
  DataTable,
  DataTableAlignment,
  DataTableColumnSize,
  DataTableHeadColumn,
  DataTableHeadRow,
  DataTableRow,
  DataTableColumn,
  DataTableSelect,
} from '../../ui-kit/DataTable';
import useTranslation from '../../i18n/useTranslation';
import Link from 'next/link';
import { PencilThick, Eye, TrashFilled } from '../../ui-kit/icons';
import WEB_PATHS from '../../constants/webPaths';
import { ISystemAnnouncement } from '../../models/systemAnnouncement';
import { format } from 'date-fns';

interface ISystemAnnouncementList {
  systemAnnouncements: ISystemAnnouncement[];
  onStatusChange: (id: string, status: boolean) => Promise<void>;
  onClickDelete: (announcement: ISystemAnnouncement) => Promise<void>;
  onClickPreview: (announcement: ISystemAnnouncement) => Promise<void>;
}

export const SystemAnnouncementList: FC<ISystemAnnouncementList> = ({
  systemAnnouncements,
  onStatusChange,
  onClickDelete,
  onClickPreview,
}) => {
  const { t } = useTranslation();

  const actionOptions = useMemo(
    () => [
      {
        label: t('systemAnnouncementListPage.active'),
        value: true,
      },
      {
        label: t('systemAnnouncementListPage.inactive'),
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
            {t('systemAnnouncementListPage.title')}
          </DataTableHeadColumn>
          <DataTableHeadColumn
            orderBy="endDate"
            size={DataTableColumnSize.LONG}
          >
            {t('systemAnnouncementListPage.duration')}
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
            {t('systemAnnouncementListPage.preview')}
          </DataTableHeadColumn>
          <DataTableHeadColumn
            size={DataTableColumnSize.SHORTER}
            align={DataTableAlignment.CENTER}
          >
            {t('systemAnnouncementListPage.action')}
          </DataTableHeadColumn>
        </DataTableHeadRow>
      </thead>
      <tbody>
        {systemAnnouncements.map((sa) => (
          <DataTableRow key={sa.id}>
            <DataTableColumn>
              {`${sa.title.nameEn} / ${sa.title.nameTh}`}
            </DataTableColumn>
            <DataTableColumn className="uppercase">
              {`${format(new Date(sa.startDate), 'dd MMM yy')} - ${format(
                new Date(sa.endDate),
                'dd MMM yy',
              )}`}
            </DataTableColumn>
            <DataTableColumn>
              <DataTableSelect
                options={actionOptions}
                value={
                  actionOptions.find(
                    (option) => option.value === sa.isActive,
                  ) || actionOptions[1]
                }
                onChange={(value) => onStatusChange(sa.id, value)}
              />
            </DataTableColumn>
            <DataTableColumn>
              <div className="flex w-full items-center justify-center">
                <button className="w-min" onClick={() => onClickPreview(sa)}>
                  <Eye className="h-5 w-5 text-gray-650" />
                </button>
              </div>
            </DataTableColumn>
            <DataTableColumn>
              <div className="flex flex-row items-center justify-between text-gray-650">
                <Link
                  href={`${WEB_PATHS.SYSTEM_ANNOUNCEMENT_ID.replace(
                    ':id',
                    sa.id,
                  )}`}
                  passHref
                >
                  <a className="w-min">
                    <PencilThick className="h-5 w-5" />
                  </a>
                </Link>
                <div className="h-5 w-1px bg-gray-400" />
                <button onClick={() => onClickDelete(sa)}>
                  <TrashFilled className="h-5 w-5" />
                </button>
              </div>
            </DataTableColumn>
          </DataTableRow>
        ))}
      </tbody>
    </DataTable>
  );
};
