import cx from 'classnames';
import Head from 'next/head';
import { format, isSameDay } from 'date-fns';
import { useRouter } from 'next/router';
import fileDownload from 'js-file-download';
import { FC, useEffect } from 'react';

import Button from '../../ui-kit/Button';
import SessionHeader from './SessionHeader';
import WEB_PATHS from '../../constants/webPaths';
import AddRegistrantModal from './AddRegistrantModal';
import { useModal } from '../../ui-kit/HeadlessModal';
import useTranslation from '../../i18n/useTranslation';
import { AdminLayout } from '../../layouts/admin.layout';
import { Attended, Close, Trash } from '../../ui-kit/icons';
import CourseSessionApi from '../../http/course-session.api';
import { AccessControl } from '../../app-state/accessControl';
import ConfirmationModal from '../../ui-kit/ConfirmationModal';
import SessionAttendance from '../../models/session-attendance';
import SessionParticipantsList from './SessionParticipantsList';
import { CourseSessionBookingStatus } from '../../models/course';
import { BACKEND_ADMIN_CONTROL } from '../../constants/policies';
import { TabKey, useSessionDetailPage } from './useSessionDetailPage';
import { SessionParticipantsCancelledList } from './SessionParticipantsCancelledList';

const DEFAULT_ITEMS_PER_PAGE = 20;

export const SessionsDetailPage: FC<any> = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const {
    courseAttendants,
    cancelldAttendants,
    selectedAttendances,
    setSelectedAttendances,
    relatedCourseSessions,
    isAllowedToMarkStudents,
    handleConfirmCancelSession,
    handleChangeTab,
    tab,
    handleConfirmCancelSessionUser,
    handleAttendanceStatusChanged,
    handleSelectAllAttendances,
    handleSelectAttendance,
    reloadAll,
    loadCourseSession,
    sessionId,
    courseSession,
    isAllowedToCancelStudents,
  } = useSessionDetailPage();
  const confirmCancelSessionModalProps = useModal();
  const confirmCancelSessionUserModalProps = useModal();
  const addRegistrantModalProps = useModal();

  function onClickAddRegistrant() {
    addRegistrantModalProps.toggle(true);
  }

  async function onClickExport() {
    const res = await CourseSessionApi.getParticipantReports(sessionId);

    let fileName = `${courseSession.courseTitle.split(' ').join('-')}_${format(
      new Date(courseSession.startDateTime),
      'ddMMyyyy',
    )}`;

    if (
      !isSameDay(
        new Date(courseSession.startDateTime),
        new Date(courseSession.endDateTime),
      )
    ) {
      fileName = `${fileName}-${format(
        new Date(courseSession.endDateTime),
        'ddMMyyyy',
      )}`;
    }

    fileDownload(res.data, `${fileName}.csv`);
  }

  /* eslint-disable @typescript-eslint/no-empty-function */
  function onClickEdit() {
    router.push(WEB_PATHS.SESSION_MANAGEMENT_EDIT.replace(':id', sessionId));
  }

  function onClickCancelSession() {
    confirmCancelSessionModalProps.toggle();
  }

  function onAttendanceStatusChange(
    attendance: SessionAttendance,
    status: CourseSessionBookingStatus,
  ) {
    if (status === CourseSessionBookingStatus.CANCELLED) {
      setSelectedAttendances([attendance]);
      confirmCancelSessionUserModalProps.toggle();
    } else {
      handleAttendanceStatusChanged([attendance.id], status);
    }
  }

  useEffect(() => {
    loadCourseSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  useEffect(() => {
    handleSelectAllAttendances(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseAttendants.data, cancelldAttendants.data]);

  if (!courseSession) return null;

  return (
    <AccessControl
      policyNames={[
        BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
        BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT,
      ]}
    >
      <AdminLayout>
        <Head>
          <title>
            {t('headerText')} | {t('sessionParticipantManagementPage.title')}
          </title>
        </Head>
        <div className="mx-auto w-full lg:w-256 xl:w-299">
          <SessionHeader
            courseSession={courseSession}
            relatedCourseSessions={relatedCourseSessions}
            onClickAddRegistrant={onClickAddRegistrant}
            onClickCancelSession={onClickCancelSession}
            onClickEdit={onClickEdit}
            onClickExport={onClickExport}
          />
          <div className="mt-6 mb-8 flex items-center space-x-8 font-semibold">
            <a
              className={cx('space-x-1 py-4', {
                'border-b-2 border-brand-primary text-brand-primary':
                  tab === TabKey.Active,
              })}
              onClick={() => handleChangeTab(TabKey.Active)}
            >
              <span>{t('sessionParticipantManagementPage.classListing')}</span>
              <span>({courseAttendants?.count || 0})</span>
            </a>
            <a
              className={cx('space-x-1 py-4', {
                'border-b-2 border-brand-primary text-brand-primary':
                  tab === TabKey.Cancelled,
              })}
              onClick={() => handleChangeTab(TabKey.Cancelled)}
            >
              <span>
                {t('sessionParticipantManagementPage.cancellingUsers')}
              </span>
              <span>({cancelldAttendants?.count || 0})</span>
            </a>
          </div>
          {selectedAttendances.length > 0 && tab === TabKey.Active && (
            <div className="mb-7 flex items-center space-x-4">
              <span className="font-semibold">
                {t('sessionParticipantManagementPage.selected', {
                  n: selectedAttendances.length,
                })}
              </span>
              <Button
                avoidFullWidth
                className="items-center space-x-2 py-2 px-6 font-semibold"
                onClick={() =>
                  handleAttendanceStatusChanged(
                    selectedAttendances.map((it) => it.id),
                    CourseSessionBookingStatus.NO_MARK,
                  )
                }
                disabled={!isAllowedToMarkStudents}
              >
                <span>{t('sessionParticipantManagementPage.unassign')}</span>
              </Button>
              <Button
                avoidFullWidth
                className="items-center space-x-2 py-2 px-6 font-semibold"
                onClick={() =>
                  handleAttendanceStatusChanged(
                    selectedAttendances.map((it) => it.id),
                    CourseSessionBookingStatus.ATTENDED,
                  )
                }
                disabled={!isAllowedToMarkStudents}
              >
                <Attended />
                <span>{t('sessionParticipantManagementPage.attended')}</span>
              </Button>
              <Button
                avoidFullWidth
                className="items-center space-x-2 py-2 px-6 font-semibold"
                onClick={() =>
                  handleAttendanceStatusChanged(
                    selectedAttendances.map((it) => it.id),
                    CourseSessionBookingStatus.NOT_ATTENDED,
                  )
                }
                disabled={!isAllowedToMarkStudents}
              >
                <Close />
                <span>{t('sessionParticipantManagementPage.absent')}</span>
              </Button>
              <Button
                avoidFullWidth
                className="items-center space-x-2 py-2 px-6 font-semibold"
                onClick={() => confirmCancelSessionUserModalProps.toggle()}
                disabled={!isAllowedToCancelStudents}
              >
                <Trash />
                <span>{t('sessionParticipantManagementPage.cancel')}</span>
              </Button>
            </div>
          )}
          {tab === TabKey.Active && (
            <SessionParticipantsList
              session={courseSession}
              items={courseAttendants.data}
              selectedItems={selectedAttendances}
              totalPages={courseAttendants.totalPages}
              totalRecords={courseAttendants.count}
              itemsPerPage={DEFAULT_ITEMS_PER_PAGE}
              onSelectAllChanged={handleSelectAllAttendances}
              onSelectItem={handleSelectAttendance}
              handleAttendanceStatusChanged={onAttendanceStatusChange}
            />
          )}
          {tab === TabKey.Cancelled && (
            <SessionParticipantsCancelledList
              itemList={cancelldAttendants}
              itemsPerPage={DEFAULT_ITEMS_PER_PAGE}
            />
          )}
          <ConfirmationModal
            header={t(
              'sessionParticipantManagementPage.cancelledList.cancelThisSession',
            )}
            body={
              <span className="text-red-200">
                {t('sessionParticipantManagementPage.actionCannotUndone')}
              </span>
            }
            toggle={confirmCancelSessionModalProps.toggle}
            isOpen={confirmCancelSessionModalProps.isOpen}
            cancelBtnInner={t('sessionParticipantManagementPage.cancel')}
            confirmBtnInner={
              <span className="whitespace-nowrap">
                {t('sessionParticipantManagementPage.cancelThisSession')}
              </span>
            }
            onOk={handleConfirmCancelSession}
          />
          <ConfirmationModal
            header={t(
              'sessionParticipantManagementPage.cancelledList.cancelThisUser',
            )}
            body={
              <span className="text-red-200">
                {t('sessionParticipantManagementPage.registrantCancelled')}
              </span>
            }
            toggle={confirmCancelSessionUserModalProps.toggle}
            isOpen={confirmCancelSessionUserModalProps.isOpen}
            cancelBtnInner={t('sessionParticipantManagementPage.cancel')}
            confirmBtnInner={
              <span className="whitespace-nowrap">
                {t('sessionParticipantManagementPage.cancelUser')}
              </span>
            }
            onCancel={() => {
              setSelectedAttendances([]);
            }}
            onOk={() =>
              handleConfirmCancelSessionUser(
                selectedAttendances.map((sa) => sa.id),
              )
            }
          />
          <AddRegistrantModal
            isOpen={addRegistrantModalProps.isOpen}
            toggle={addRegistrantModalProps.toggle}
            session={courseSession}
            onAddRegistrantsCompleted={() => {
              reloadAll();
            }}
            onAvailableSeatConflict={async () => {
              await loadCourseSession();
            }}
          />
        </div>
      </AdminLayout>
    </AccessControl>
  );
};
