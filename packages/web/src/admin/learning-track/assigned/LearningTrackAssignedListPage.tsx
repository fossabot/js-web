import { format } from 'date-fns';
import uniq from 'lodash/uniq';
import Head from 'next/head';
import { Fragment, useCallback, useState } from 'react';
import { AccessControl } from '../../../app-state/accessControl';
import API_PATHS from '../../../constants/apiPaths';
import { BACKEND_ADMIN_CONTROL } from '../../../constants/policies';
import WEB_PATHS from '../../../constants/webPaths';
import { centralHttp } from '../../../http';
import useTranslation from '../../../i18n/useTranslation';
import { AdminLayout } from '../../../layouts/admin.layout';
import { BaseResponseDto } from '../../../models/BaseResponse.dto';
import { UserAssignedLearningTrack } from '../../../models/userAssignedLearningTrack';
import PaginationIndicator from '../../../shared/PaginationIndicator';
import { AdminSearchInput } from '../../../ui-kit/AdminSearchInput';
import Button from '../../../ui-kit/Button';
import {
  DataTable,
  DataTableColumn,
  DataTableColumnSize,
  DataTableHeadColumn,
  DataTableHeadRow,
  DataTableRow,
  stickyBorderShadow,
} from '../../../ui-kit/DataTable';
import {
  CloudDownload,
  CloudUpload,
  History,
  PencilThick,
  Plus,
} from '../../../ui-kit/icons';
import InputCheckbox from '../../../ui-kit/InputCheckbox';
import {
  ILearningTrackAssignedFormModal,
  LearningTrackAssignedFormModal,
} from './LearningTrackAssignedFormModal';
import { useLearningTrackAssigned } from './useLearningTrackAssigned';
import useLearningTrackAssignedBulkUpload from './useLearningTrackAssignedBulkUpload';

export const LearningTrackAssignedListPage = () => {
  const { t } = useTranslation();

  const [formModalProps, setFormModalProps] =
    useState<ILearningTrackAssignedFormModal['data']>(null);

  const {
    areAllUserAssignedLearningTracksSelected,
    onChangeFilter,
    pagination,
    selectedUserAssignedLearningTracks,
    setSelectedUserAssignedLearningTracks,
    userAssignedLearningTracks,
    userAssignedLearningTracksFilter,
    onRefresh,
  } = useLearningTrackAssigned();
  const { downloadTemplate } = useLearningTrackAssignedBulkUpload();

  const getSearchResults = useCallback(async (term: string) => {
    const res = await centralHttp.get<
      BaseResponseDto<UserAssignedLearningTrack[]>
    >(API_PATHS.USER_ASSIGNED_LEARNING_TRACK, {
      params: { search: term, perPage: 5 },
    });
    const emails: string[] = [];
    const learningTracks: string[] = [];
    const lowerCaseTerm = term.toLowerCase();
    for (const item of res.data.data) {
      if (item.user.email.toLowerCase().includes(lowerCaseTerm)) {
        emails.push(item.user.email);
      }
      if (item.learningTrack.title.toLowerCase().includes(lowerCaseTerm)) {
        learningTracks.push(item.learningTrack.title);
      }
    }

    return uniq([...emails, ...learningTracks]);
  }, []);

  return (
    <AccessControl
      policyNames={[
        BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
        BACKEND_ADMIN_CONTROL.ACCESS_LEARNING_TRACK_MANAGEMENT,
      ]}
    >
      <AdminLayout>
        <Head>
          <title>{t('headerText')} | Learning Track assigned</title>
        </Head>
        <div className="flex h-full flex-col">
          <div className="flex justify-between">
            <div className="flex items-end space-x-3">
              <h1 className="text-subtitle font-semibold">
                Learning Track assigned
              </h1>
            </div>
            <div className="flex space-x-2">
              <Button
                avoidFullWidth
                variant="secondary"
                size="medium"
                iconLeft={<Plus />}
                className="space-x-2"
                onClick={() => {
                  setFormModalProps({ type: 'add', data: null });
                }}
              >
                <span className="font-semibold">Add</span>
              </Button>
              <Button
                avoidFullWidth
                variant="primary"
                size="medium"
                className="space-x-2"
                link={WEB_PATHS.LEARNING_TRACK_ASSIGNED_BULK_UPLOAD}
              >
                <div className="flex items-center">
                  <CloudUpload className="mr-2 w-4" />
                  <span className="font-semibold">Upload bulk</span>
                </div>
              </Button>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <div className="-ml-4 flex">
              <Button
                variant="ghost"
                iconLeft={<History className="text-caption" />}
                avoidFullWidth
                size="medium"
                className="space-x-2"
                link={WEB_PATHS.LEARNING_TRACK_ASSIGNED_BULK_UPLOAD_HISTORY}
              >
                <span className="font-semibold">View Upload History</span>
              </Button>

              <div className="min-w-px bg-gray-200"></div>

              <Button
                variant="ghost"
                iconLeft={<CloudDownload />}
                avoidFullWidth
                size="medium"
                className="space-x-2 text-gray-650"
                onClick={() => downloadTemplate()}
              >
                <span className="font-semibold">Download template</span>
              </Button>
            </div>
            <AdminSearchInput
              value={userAssignedLearningTracksFilter.search}
              onChangeFilter={onChangeFilter}
              placeholder="Search keyword"
              getSearchResults={getSearchResults}
            />
          </div>
          <div className="mt-6 flex-1">
            {!userAssignedLearningTracks && (
              <div className="flex h-full flex-1 items-center justify-center">
                <div className="loader h-6 w-6 animate-spin rounded-full border-4 border-gray-500" />
              </div>
            )}
            {userAssignedLearningTracks &&
              userAssignedLearningTracks.length === 0 && (
                <div className="w-full">
                  <img className="m-auto w-max" src="/assets/empty-user.png" />
                  <div className="text-center text-heading font-semibold">
                    No learning tracks assigned
                  </div>
                </div>
              )}
            {userAssignedLearningTracks &&
              userAssignedLearningTracks.length > 0 && (
                <DataTable containerClassName="h-full">
                  <thead>
                    <DataTableHeadRow>
                      <DataTableHeadColumn
                        size={DataTableColumnSize.CHECKBOX}
                        className="sticky left-0 bg-gray-100"
                      >
                        <InputCheckbox
                          name="selectAll"
                          checked={areAllUserAssignedLearningTracksSelected}
                          onChange={(e) =>
                            e.target.checked && userAssignedLearningTracks
                              ? setSelectedUserAssignedLearningTracks(
                                  userAssignedLearningTracks.reduce(
                                    (acc, curr) => {
                                      acc[curr.id] = true;
                                      return acc;
                                    },
                                    {},
                                  ),
                                )
                              : setSelectedUserAssignedLearningTracks({})
                          }
                        />
                      </DataTableHeadColumn>
                      <DataTableHeadColumn
                        size={DataTableColumnSize.LONG}
                        className="sticky bg-gray-100"
                        orderBy="learningTrackTitle"
                        style={{ left: 40 }}
                      >
                        Learning Track title
                      </DataTableHeadColumn>
                      <DataTableHeadColumn
                        size={DataTableColumnSize.LONG}
                        className="sticky bg-gray-100"
                        orderBy="email"
                        style={{
                          left: 264,
                          ...stickyBorderShadow,
                        }}
                      >
                        User
                      </DataTableHeadColumn>
                      <DataTableHeadColumn orderBy="groupName">
                        Group
                      </DataTableHeadColumn>
                      <DataTableHeadColumn orderBy="organizationName">
                        Org
                      </DataTableHeadColumn>
                      <DataTableHeadColumn orderBy="createdAt">
                        Created date
                      </DataTableHeadColumn>
                      <DataTableHeadColumn orderBy="dueDateTime">
                        Expiry date
                      </DataTableHeadColumn>
                      <DataTableHeadColumn>Action</DataTableHeadColumn>
                    </DataTableHeadRow>
                  </thead>
                  <tbody className="text-caption">
                    {userAssignedLearningTracks?.map((item) => (
                      <Fragment key={item.id}>
                        <DataTableRow>
                          <DataTableColumn className="sticky left-0 bg-white">
                            <InputCheckbox
                              name={`select_${item.id}`}
                              checked={
                                !!selectedUserAssignedLearningTracks[item.id]
                              }
                              onChange={() =>
                                setSelectedUserAssignedLearningTracks(
                                  (selected) => {
                                    if (selected[item.id]) {
                                      delete selected[item.id];
                                    } else {
                                      selected[item.id] = true;
                                    }
                                    return { ...selected };
                                  },
                                )
                              }
                            />
                          </DataTableColumn>
                          <DataTableColumn
                            className="sticky truncate bg-white"
                            title={item.learningTrack.title}
                            style={{ left: 40 }}
                          >
                            {item.learningTrack.title}
                          </DataTableColumn>
                          <DataTableColumn
                            className="sticky truncate bg-white"
                            title={item.user.email}
                            style={{
                              left: 264,
                              ...stickyBorderShadow,
                            }}
                          >
                            {item.user.email}
                          </DataTableColumn>
                          <DataTableColumn
                            className="truncate"
                            title={item.groupName}
                          >
                            {item.groupName || '-'}
                          </DataTableColumn>
                          <DataTableColumn
                            className="truncate"
                            title={item.organizationName}
                          >
                            {item.organizationName || '-'}
                          </DataTableColumn>
                          <DataTableColumn>
                            {format(
                              new Date(item.createdAt),
                              'dd MMM, yy HH:mm',
                            )}
                          </DataTableColumn>
                          <DataTableColumn>
                            {item.dueDateTime
                              ? format(
                                  new Date(item.dueDateTime),
                                  'dd MMM, yy HH:mm',
                                )
                              : '-'}
                          </DataTableColumn>
                          <DataTableColumn>
                            <a
                              role="button"
                              className="flex items-center space-x-2 font-semibold text-gray-650"
                              onClick={() => {
                                setFormModalProps({ type: 'edit', data: item });
                              }}
                            >
                              <span>Edit</span>
                              <PencilThick className="h-4 w-4" />
                            </a>
                          </DataTableColumn>
                        </DataTableRow>
                      </Fragment>
                    ))}
                  </tbody>
                </DataTable>
              )}
          </div>
          {pagination !== undefined &&
            userAssignedLearningTracks !== undefined &&
            userAssignedLearningTracks.length > 0 && (
              <PaginationIndicator
                totalPages={pagination.totalPages}
                defaultPerPage={pagination.perPage}
                resultLength={userAssignedLearningTracks.length}
                totalRecords={pagination.total}
                showPageSizeDropDown={true}
              />
            )}
        </div>
      </AdminLayout>
      <LearningTrackAssignedFormModal
        data={formModalProps}
        toggle={() => setFormModalProps(null)}
        onSubmit={onRefresh}
      />
    </AccessControl>
  );
};
