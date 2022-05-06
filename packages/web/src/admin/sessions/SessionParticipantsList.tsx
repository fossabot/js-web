import { format } from 'date-fns';
import { useMemo, ReactNode } from 'react';
import useTranslation from '../../i18n/useTranslation';
import {
  CourseSessionBookingStatus,
  CourseSessionStatus,
} from '../../models/course';
import { CourseSessionOverview } from '../../models/course-session';
import SessionAttendance from '../../models/session-attendance';
import PaginationIndicator from '../../shared/PaginationIndicator';
import {
  DataTable,
  DataTableColumn,
  DataTableColumnSize,
  DataTableHeadColumn,
  DataTableHeadRow,
  DataTableRow,
  DataTableSelect,
} from '../../ui-kit/DataTable';
import { Attended, Close, Trash } from '../../ui-kit/icons';
import InputCheckbox from '../../ui-kit/InputCheckbox';

interface ISessionParticipantsList {
  session: CourseSessionOverview;
  items: SessionAttendance[];
  selectedItems: SessionAttendance[];
  totalRecords: number;
  totalPages: number;
  itemsPerPage: number;
  handleAttendanceStatusChanged: (
    attendance: SessionAttendance,
    status: CourseSessionBookingStatus,
  ) => void;
  onSelectItem: (item: SessionAttendance, isSelected: boolean) => void;
  onSelectAllChanged: (isSelected: boolean) => void;
}

function SessionParticipantsList({
  session,
  items,
  selectedItems,
  totalRecords,
  totalPages,
  itemsPerPage,
  onSelectItem,
  onSelectAllChanged,
  handleAttendanceStatusChanged,
}: ISessionParticipantsList) {
  const { t } = useTranslation();

  const actionableStatuses = useMemo(
    () => [
      CourseSessionStatus.NOT_STARTED,
      CourseSessionStatus.IN_PROGRESS,
      CourseSessionStatus.COMPLETED,
    ],
    [],
  );

  if (items.length <= 0) {
    return (
      <div className="w-full">
        <img className="m-auto w-max" src="/assets/empty-user.png" />
        <div className="text-center text-heading font-semibold">
          {t('sessionParticipantManagementPage.noStudents')}
        </div>
      </div>
    );
  }

  const actionOptions: {
    label: string;
    value: CourseSessionBookingStatus;
    className: string;
    icon?: ReactNode;
  }[] = [
    {
      label: t('sessionParticipantManagementPage.unassign'),
      value: CourseSessionBookingStatus.NO_MARK,
      className: 'text-black',
    },
    {
      label: t('sessionParticipantManagementPage.attended'),
      value: CourseSessionBookingStatus.ATTENDED,
      className: 'text-green-200',
      icon: <Attended />,
    },
    {
      label: t('sessionParticipantManagementPage.absent'),
      value: CourseSessionBookingStatus.NOT_ATTENDED,
      className: 'text-brand-primary',
      icon: <Close />,
    },
    {
      label: t('sessionParticipantManagementPage.cancel'),
      value: CourseSessionBookingStatus.CANCELLED,
      className: 'text-black',
      icon: <Trash />,
    },
  ];

  return (
    <div className="w-full">
      <DataTable>
        <thead>
          <DataTableHeadRow>
            <DataTableHeadColumn size={DataTableColumnSize.CHECKBOX}>
              <InputCheckbox
                name="selectAll"
                checked={items.length === selectedItems.length}
                onChange={(e) => onSelectAllChanged(e.target.checked)}
              />
            </DataTableHeadColumn>
            <DataTableHeadColumn orderBy="name">
              {t('sessionParticipantManagementPage.header.fullName')}
            </DataTableHeadColumn>
            <DataTableHeadColumn orderBy="organization">
              {t('sessionParticipantManagementPage.header.organization')}
            </DataTableHeadColumn>
            <DataTableHeadColumn
              size={DataTableColumnSize.LONG}
              orderBy="email"
            >
              {t('sessionParticipantManagementPage.header.email')}
            </DataTableHeadColumn>
            <DataTableHeadColumn size={DataTableColumnSize.SHORT}>
              {t('sessionParticipantManagementPage.header.action')}
            </DataTableHeadColumn>
            <DataTableHeadColumn orderBy="expiryDate">
              {t('sessionParticipantManagementPage.header.expiryDate')}
            </DataTableHeadColumn>
            <DataTableHeadColumn orderBy="phoneNumber">
              {t('sessionParticipantManagementPage.header.phone')}
            </DataTableHeadColumn>
          </DataTableHeadRow>
        </thead>
        <tbody>
          {items.map((it) => (
            <DataTableRow key={it.id}>
              <DataTableColumn className="w-min">
                <InputCheckbox
                  name={`select_${it.id}`}
                  checked={selectedItems.includes(it)}
                  onChange={(e) => onSelectItem(it, e.target.checked)}
                />
              </DataTableColumn>
              <DataTableColumn>
                {`${it.firstName} ${it.lastName}`.trim()}
              </DataTableColumn>
              <DataTableColumn>{it.organizationName || '-'}</DataTableColumn>
              <DataTableColumn optional={true}>{it.email}</DataTableColumn>
              <DataTableColumn>
                <DataTableSelect
                  options={actionOptions}
                  value={
                    actionOptions.find((a) => a.value === it.bookingStatus) ||
                    actionOptions[0]
                  }
                  isDisabled={
                    !actionableStatuses.includes(session.sessionStatus)
                  }
                  onChange={(value) => handleAttendanceStatusChanged(it, value)}
                />
              </DataTableColumn>
              <DataTableColumn optional={true}>
                {it.subscriptionExpiryDate
                  ? format(
                      new Date(it.subscriptionExpiryDate),
                      'd MMM, y HH:mm',
                    )
                  : '-'}
              </DataTableColumn>
              <DataTableColumn optional={true}>
                {it.phoneNumber || '-'}
              </DataTableColumn>
            </DataTableRow>
          ))}
        </tbody>
      </DataTable>
      <PaginationIndicator
        defaultPerPage={itemsPerPage}
        totalPages={totalPages}
        totalRecords={totalRecords}
        resultLength={items.length}
        showPageSizeDropDown={true}
      />
    </div>
  );
}

export default SessionParticipantsList;
