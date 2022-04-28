import { format, isEqual, isSameDay } from 'date-fns';
import fileDownload from 'js-file-download';
import cloneDeep from 'lodash/cloneDeep';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';
import { AccessControl } from '../../app-state/accessControl';
import API_PATHS from '../../constants/apiPaths';
import { BACKEND_ADMIN_CONTROL } from '../../constants/policies';
import WEB_PATHS from '../../constants/webPaths';
import useCourseSessionBulkUpload from '../../hooks/useCourseSessionBulkUpload';
import { centralHttp } from '../../http';
import useTranslation from '../../i18n/useTranslation';
import { AdminLayout } from '../../layouts/admin.layout';
import { CourseCategoryKey, CourseSubCategoryKey } from '../../models/course';
import PaginationIndicator from '../../shared/PaginationIndicator';
import { AdminSearchInput } from '../../ui-kit/AdminSearchInput';
import Button from '../../ui-kit/Button';
import { DatePicker } from '../../ui-kit/DatePicker/DatePicker';
import {
  Calendar,
  CloudDownload,
  CloudUpload,
  ExternalLink,
  History,
  Plus,
} from '../../ui-kit/icons';
import InputSelect from '../../ui-kit/InputSelect';
import { SessionsCourseItem } from './SessionsCourseItem';
import {
  initialListFilters,
  ISessionsListFilters,
  SessionStatus,
  transformFiltersToQuery,
  useSessionsList,
} from './useSessionList';

const typeOptions: { label: string; value: ISessionsListFilters['type'] }[] = [
  { label: 'All Types', value: undefined },
  {
    label: 'Face to Face',
    value: CourseSubCategoryKey.FACE_TO_FACE,
  },
  { label: 'Virtual', value: CourseSubCategoryKey.VIRTUAL },
];

const statusOptions: {
  label: string;
  value: SessionStatus | undefined;
}[] = [
  { label: 'All Status', value: undefined },
  {
    label: 'Not Started',
    value: SessionStatus.NOT_STARTED,
  },
  {
    label: 'In Progress',
    value: SessionStatus.IN_PROGRESS,
  },
  {
    label: 'Completed',
    value: SessionStatus.COMPLETED,
  },
  {
    label: 'Cancelled',
    value: SessionStatus.CANCELLED,
  },
];

export const SessionsListPage = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const {
    sessionListFilters,
    sessionCourses,
    onChangeFilter,
    totalSessions,
    pagination,
    instructors,
    instructorsMap,
  } = useSessionsList();
  const { downloadTemplate } = useCourseSessionBulkUpload();

  const handleDownloadTemplate = useCallback(async () => {
    const { data } = await centralHttp.get(API_PATHS.COURSE_OUTLINES, {
      params: {
        perPage: 10000,
        search: CourseCategoryKey.LEARNING_EVENT,
        searchField: 'courseCategoryKey',
        orderBy: 'createdAt',
        order: 'DESC',
      },
    });
    await downloadTemplate(data.data);
  }, [downloadTemplate]);

  const currentInstructor = useMemo(() => {
    const instructor = instructorsMap[sessionListFilters.instructorId];
    if (instructor) {
      return {
        label: `${instructor.firstName} ${instructor.lastName}`,
        value: instructor.id,
      };
    }
    return {
      label: 'All Instructor',
      value: undefined,
    };
  }, [instructorsMap, sessionListFilters.instructorId]);

  const onChangeDateRange = useCallback(
    ([startTime, endTime]: [Date | null, Date | null]) => {
      onChangeFilter((query) => ({ ...query, startTime, endTime }));
    },
    [onChangeFilter],
  );

  const onExportReport = useCallback(async () => {
    const res = await centralHttp.get(
      API_PATHS.COURSE_SESSIONS_MANAGEMENT_EXPORT_REPORT,
      {
        responseType: 'blob',
        params: transformFiltersToQuery(sessionListFilters),
      },
    );

    let fileName = `sessionreport_${format(
      sessionListFilters.startTime,
      'ddMMyyyy',
    )}`;

    if (!isSameDay(sessionListFilters.startTime, sessionListFilters.endTime)) {
      fileName = `${fileName}-${format(
        sessionListFilters.endTime,
        'ddMMyyyy',
      )}`;
    }

    fileDownload(res.data, `${fileName}.csv`);
  }, [sessionListFilters]);

  return (
    <AccessControl
      policyNames={[
        BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
        BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT,
      ]}
    >
      <AdminLayout>
        <Head>
          <title>{t('headerText')} | Session Management</title>
        </Head>
        <div className="flex h-full flex-col">
          <div className="flex justify-between">
            <div className="flex items-end space-x-3">
              <h1 className="text-subtitle font-semibold">
                Session Management
              </h1>
              {totalSessions !== undefined && (
                <div className="text-subheading font-semibold text-gray-500">
                  ({totalSessions} Session{totalSessions === 1 ? '' : 's'})
                </div>
              )}
            </div>
            <div className="flex space-x-2">
              <Button
                avoidFullWidth
                variant="secondary"
                size="medium"
                iconLeft={<Plus />}
                className="space-x-2"
                onClick={() => router.push(WEB_PATHS.SESSION_MANAGEMENT_CREATE)}
              >
                <span className="font-semibold">Add Session</span>
              </Button>
              <Button
                avoidFullWidth
                variant="primary"
                size="medium"
                className="space-x-2"
                onClick={() =>
                  router.push(WEB_PATHS.SESSION_MANAGEMENT_BULK_UPLOAD)
                }
              >
                <Link href={WEB_PATHS.SESSION_MANAGEMENT_BULK_UPLOAD}>
                  <a className="flex items-center">
                    <CloudUpload className="mr-2 w-4" />
                    <span className="font-semibold">Upload bulk</span>
                  </a>
                </Link>
              </Button>
              <Button
                avoidFullWidth
                variant="primary"
                size="medium"
                iconLeft={<ExternalLink />}
                className="space-x-2"
                onClick={onExportReport}
              >
                <span className="font-semibold">Export</span>
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
                onClick={() =>
                  router.push(WEB_PATHS.SESSION_MANAGEMENT_BULK_UPLOAD_HISTORY)
                }
              >
                <span className="font-semibold">View Upload History</span>
              </Button>

              <div className="w-px bg-gray-200"></div>

              <Button
                variant="ghost"
                iconLeft={<CloudDownload />}
                avoidFullWidth
                size="medium"
                className="space-x-2 text-gray-650"
                onClick={handleDownloadTemplate}
              >
                <span className="font-semibold">Download template</span>
              </Button>
            </div>
            <AdminSearchInput
              value={sessionListFilters.search}
              onChangeFilter={onChangeFilter}
              apiPath={API_PATHS.COURSE_SESSIONS_MANAGEMENT_SUGGESTIONS}
              placeholder="Search for a session"
            />
          </div>
          <div className="mt-6 border-t border-gray-200">
            <div className="mt-6 flex items-stretch space-x-3">
              <DatePicker
                startDate={sessionListFilters.startTime}
                endDate={sessionListFilters.endTime}
                onChange={onChangeDateRange}
                size="small"
                closeCalendarOnChange={false}
              >
                {({ ref, showCalendar }) => (
                  <div
                    ref={ref}
                    className="flex w-full items-center space-x-2 rounded-lg border border-gray-300 px-4"
                    onClick={showCalendar}
                  >
                    <Calendar />
                    <span>
                      {isEqual(
                        sessionListFilters.startTime,
                        sessionListFilters.endTime,
                      )
                        ? format(sessionListFilters.startTime, 'dd MMM yyyy')
                        : `${format(
                            sessionListFilters.startTime,
                            'dd MMM yyyy',
                          )} - ${format(
                            sessionListFilters.endTime,
                            'dd MMM yyyy',
                          )}`}
                    </span>
                  </div>
                )}
              </DatePicker>

              <InputSelect
                name="type"
                value={typeOptions.find(
                  (option) => option.value === sessionListFilters.type,
                )}
                renderOptions={typeOptions}
                onChange={(e) => {
                  onChangeFilter((query) => ({
                    ...query,
                    type: e.target.value,
                  }));
                }}
              />
              <InputSelect
                name="status"
                value={statusOptions.find(
                  (option) => option.value === sessionListFilters.status,
                )}
                renderOptions={statusOptions}
                onChange={(e) => {
                  onChangeFilter((query) => ({
                    ...query,
                    status: e.target.value,
                  }));
                }}
              />
              <InputSelect
                name="instructor"
                value={currentInstructor}
                isSearchable
                renderOptions={[
                  { label: 'All Instructor', value: undefined },
                  ...instructors.map((instructor) => ({
                    label: `${instructor.firstName} ${instructor.lastName}`,
                    value: instructor.id,
                  })),
                ]}
                onChange={(e) => {
                  onChangeFilter((query) => ({
                    ...query,
                    instructorId: e.target.value,
                  }));
                }}
              />
              <div className="w-px bg-gray-200"></div>

              <a
                role="button"
                className="self-center font-semibold text-brand-primary"
                onClick={() => {
                  onChangeFilter(() => cloneDeep(initialListFilters));
                }}
              >
                Clear
              </a>
            </div>
          </div>
          {sessionCourses ? (
            sessionCourses.length ? (
              <div className="mt-8 flex-1 space-y-6">
                {sessionCourses.map((course, index) => (
                  <SessionsCourseItem
                    key={course.id}
                    course={course}
                    initialIsShowing={index === 0}
                    instructorsMap={instructorsMap}
                    sessionListFilters={sessionListFilters}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center space-y-4">
                <img src="/assets/empty.png" alt="Empty" />
                <div className="text-heading font-semibold">
                  No sessions found
                </div>
              </div>
            )
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="loader h-6 w-6 animate-spin rounded-full border-4 border-gray-500" />
            </div>
          )}
          {pagination !== undefined &&
            sessionCourses !== undefined &&
            sessionCourses.length > 0 && (
              <div className="mt-10">
                <PaginationIndicator
                  totalPages={pagination.totalPages}
                  defaultPerPage={pagination.perPage}
                  resultLength={sessionCourses.length}
                  totalRecords={pagination.total}
                  showPageSizeDropDown={true}
                />
              </div>
            )}
        </div>
      </AdminLayout>
    </AccessControl>
  );
};
