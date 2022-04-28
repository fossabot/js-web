import { FC } from 'react';
import { ListResponse } from '../../hooks/useList';
import { ICancelledAttendant } from '../../models/cancelledAttendant';
import PaginationIndicator from '../../shared/PaginationIndicator';
import {
  DataTable,
  DataTableColumn,
  DataTableColumnSize,
  DataTableHeadColumn,
  DataTableHeadRow,
  DataTableRow,
} from '../../ui-kit/DataTable';
import InputCheckbox from '../../ui-kit/InputCheckbox';
import { format } from 'date-fns';
import useTranslation from '../../i18n/useTranslation';
import { Reason } from '../../models/userCourseSessionCancellationLog';

export interface ISessionParticipantsCancelledList {
  itemList: ListResponse<ICancelledAttendant>;
  itemsPerPage: number;
}

export const SessionParticipantsCancelledList: FC<ISessionParticipantsCancelledList> =
  (props) => {
    const { itemList, itemsPerPage } = props;
    const { data: items } = itemList;
    const { t } = useTranslation();

    function mapReason(reason: Reason) {
      const map: Record<Reason, string> = {
        [Reason.CancelledByAdmin]: t(
          'sessionParticipantManagementPage.cancelledList.cancelledByAdmin',
        ),
        [Reason.CancelledByUser]: t(
          'sessionParticipantManagementPage.cancelledList.cancelledByUser',
        ),
        [Reason.CancelledSession]: t(
          'sessionParticipantManagementPage.cancelledList.sessionCancelled',
        ),
      };

      return map[reason];
    }

    if (itemList.count <= 0) {
      return (
        <div className="w-full">
          <img className="m-auto w-max" src="/assets/empty-user.png" />
          <div className="text-center text-heading font-semibold">
            {t(
              'sessionParticipantManagementPage.cancelledList.noCancellingUsers',
            )}
          </div>
        </div>
      );
    }

    return (
      <>
        <DataTable>
          <thead>
            <DataTableHeadRow>
              <DataTableHeadColumn size={DataTableColumnSize.CHECKBOX}>
                <InputCheckbox name="selectAll" disabled />
              </DataTableHeadColumn>
              <DataTableHeadColumn orderBy="name">
                {t('sessionParticipantManagementPage.cancelledList.fullName')}
              </DataTableHeadColumn>
              <DataTableHeadColumn orderBy="organization">
                {t(
                  'sessionParticipantManagementPage.cancelledList.organization',
                )}
              </DataTableHeadColumn>
              <DataTableHeadColumn
                size={DataTableColumnSize.LONG}
                orderBy="email"
              >
                {t('sessionParticipantManagementPage.cancelledList.email')}
              </DataTableHeadColumn>
              <DataTableHeadColumn>
                {t('sessionParticipantManagementPage.cancelledList.reason')}
              </DataTableHeadColumn>
              <DataTableHeadColumn>
                {t('sessionParticipantManagementPage.cancelledList.expiryDate')}
              </DataTableHeadColumn>
              <DataTableHeadColumn>
                {t(
                  'sessionParticipantManagementPage.cancelledList.phoneNumber',
                )}
              </DataTableHeadColumn>
            </DataTableHeadRow>
          </thead>
          <tbody>
            {items.map((item) => (
              <DataTableRow key={item.id}>
                <DataTableColumn>
                  <InputCheckbox name={`select_${item.id}`} disabled />
                </DataTableColumn>
                <DataTableColumn>
                  {`${item.firstName} ${item.lastName}`.trim()}
                </DataTableColumn>
                <DataTableColumn>
                  {item.organizationName || '-'}
                </DataTableColumn>
                <DataTableColumn className="text-gray-500">
                  {item.email}
                </DataTableColumn>
                <DataTableColumn>
                  {mapReason(item.cancelledReason)}
                </DataTableColumn>
                <DataTableColumn className="text-gray-500" optional={true}>
                  {item.subscriptionExpiryDate
                    ? format(
                        new Date(item.subscriptionExpiryDate),
                        'dd MMM, yy HH:mm',
                      )
                    : '-'}
                </DataTableColumn>
                <DataTableColumn optional={true}>
                  {item.phoneNumber || '-'}
                </DataTableColumn>
              </DataTableRow>
            ))}
          </tbody>
        </DataTable>
        <PaginationIndicator
          defaultPerPage={itemsPerPage}
          totalPages={itemList.totalPages}
          totalRecords={itemList.count}
          resultLength={items.length}
          showPageSizeDropDown={true}
        />
      </>
    );
  };
