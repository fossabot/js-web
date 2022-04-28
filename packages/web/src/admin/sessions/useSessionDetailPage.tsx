import { startOfDay, endOfDay } from 'date-fns';
import { useRouter } from 'next/router';
import { useState, useEffect, useMemo } from 'react';
import { useToasts } from 'react-toast-notifications';
import API_PATHS from '../../constants/apiPaths';
import useList from '../../hooks/useList';
import { centralHttp } from '../../http';
import CourseSessionApi from '../../http/course-session.api';
import useTranslation from '../../i18n/useTranslation';
import { ICancelledAttendant } from '../../models/cancelledAttendant';
import {
  CourseSessionBookingStatus,
  CourseSessionStatus,
  ICourseSession,
} from '../../models/course';
import { CourseSessionOverview } from '../../models/course-session';
import SessionAttendance from '../../models/session-attendance';
import { Person, Trash, Warning } from '../../ui-kit/icons';
import { toastMessage } from '../../ui-kit/ToastMessage';
import { captureError } from '../../utils/error-routing';

export enum TabKey {
  Active = 'Active',
  Cancelled = 'Cancelled',
}

export function useSessionDetailPage() {
  const router = useRouter();
  const tab = TabKey[router.query?.tabKey as string] || TabKey.Active;
  const { t } = useTranslation();
  const sessionId = router.query.id as string;
  const [courseSession, setCourseSession] =
    useState<CourseSessionOverview>(null);

  const isAllowedToMarkStudents = useMemo(
    () =>
      [CourseSessionStatus.IN_PROGRESS, CourseSessionStatus.COMPLETED].includes(
        courseSession?.sessionStatus,
      ),
    [courseSession?.sessionStatus],
  );

  const isAllowedToCancelStudents = useMemo(
    () =>
      [
        CourseSessionStatus.NOT_STARTED,
        CourseSessionStatus.IN_PROGRESS,
        CourseSessionStatus.COMPLETED,
      ].includes(courseSession?.sessionStatus),
    [courseSession?.sessionStatus],
  );

  const [selectedAttendances, setSelectedAttendances] = useState<
    SessionAttendance[]
  >([]);
  const [relatedCourseSessions, setRelatedCourseSessions] = useState<
    ICourseSession[]
  >([]);

  const courseAttendants = useList<SessionAttendance>((options) => {
    return centralHttp.get(
      API_PATHS.COURSE_SESSION_ACTIVE_ATTENDANTS.replace(':id', id as string),
      { params: options },
    );
  });

  const cancelldAttendants = useList<ICancelledAttendant>((options) => {
    return centralHttp.get(
      API_PATHS.COURSE_SESSION_ATTENDANTS_CANCELLATIONS.replace(
        ':id',
        id as string,
      ),
      { params: options },
    );
  });

  const { id } = router.query;
  const { addToast } = useToasts();

  async function handleConfirmCancelSession() {
    await centralHttp.post(
      API_PATHS.COURSE_SESSION_CANCELLATIONS.replace(':id', id as string),
    );
    await reloadAll();
    addToast(
      toastMessage({
        icon: <Trash className="h-5 w-5" />,
        title: t(
          'sessionParticipantManagementPage.cancelledList.sessionCancelSuccess',
        ),
      }),
      { appearance: 'success' },
    );
  }

  function handleChangeTab(tabKey: TabKey) {
    router.replace(
      {
        query: {
          ...router.query,
          tabKey,
          page: 1,
        },
      },
      undefined,
      { scroll: false },
    );
  }

  async function handleConfirmCancelSessionUser(userIds: string[]) {
    try {
      await centralHttp.post(
        API_PATHS.COURSE_SESSION_CANCELLATIONS.replace(':id', id as string),
        { userIds },
      );
      addToast(
        toastMessage({
          icon: <Person className="h-6 w-6" />,
          title: t(
            'sessionParticipantManagementPage.cancelledList.sessionCancelUserSuccess',
            { n: userIds.length },
          ),
        }),
        { appearance: 'success' },
      );
      await reloadAll();
    } catch (error) {
      addToast(
        toastMessage({
          icon: <Warning className="h-6 w-6" />,
          title: error?.response?.data?.message || error?.message,
        }),
        { appearance: 'error' },
      );
    }
  }

  async function handleAttendanceStatusChanged(
    studentIds: string[],
    status: CourseSessionBookingStatus,
  ) {
    if (!isAllowedToMarkStudents || !studentIds.length) return;

    try {
      await CourseSessionApi.markCourseAttendances(
        courseSession.id,
        studentIds,
        status,
      );

      await reloadAll();
    } catch (error) {
      captureError(error);
    } finally {
      setSelectedAttendances([]);
    }
  }

  function handleSelectAttendance(
    item: SessionAttendance,
    isSelected: boolean,
  ) {
    let newSelectedItems = [];
    if (isSelected) {
      newSelectedItems = [...selectedAttendances, item];
    } else {
      newSelectedItems = [...selectedAttendances.filter((it) => it !== item)];
    }
    setSelectedAttendances(newSelectedItems);
  }

  function handleSelectAllAttendances(isSelected) {
    if (isSelected) {
      setSelectedAttendances(courseAttendants.data);
    } else {
      setSelectedAttendances([]);
    }
  }

  async function loadRelatedCourseSessions(
    courseOutlineId: string,
    refDateStr: string,
  ) {
    const refDate = new Date(refDateStr);
    const startTime = startOfDay(refDate);
    const endTime = endOfDay(refDate);
    const courseSessions = await CourseSessionApi.searchCourseSessions({
      courseOutlineId,
      startTime,
      endTime,
    });
    setRelatedCourseSessions(courseSessions);
  }

  async function loadCourseSession() {
    if (!sessionId) return;

    try {
      const session = await CourseSessionApi.getCourseSessionOverview(
        sessionId,
      );
      setCourseSession(session);
    } catch (error) {
      captureError(error);
    }
  }

  async function reloadAll() {
    await Promise.all([
      courseAttendants.fetchData(),
      cancelldAttendants.fetchData(),
      loadCourseSession(),
    ]);
  }

  useEffect(() => {
    if (courseSession?.courseOutlineId && courseSession?.startDateTime) {
      loadRelatedCourseSessions(
        courseSession?.courseOutlineId,
        courseSession?.startDateTime,
      );
    } else {
      setRelatedCourseSessions([]);
    }
  }, [courseSession?.courseOutlineId, courseSession?.startDateTime]);

  return {
    handleConfirmCancelSession,
    courseAttendants,
    cancelldAttendants,
    tab,
    handleChangeTab,
    handleConfirmCancelSessionUser,
    handleAttendanceStatusChanged,
    handleSelectAttendance,
    handleSelectAllAttendances,
    setSelectedAttendances,
    selectedAttendances,
    relatedCourseSessions,
    isAllowedToMarkStudents,
    reloadAll,
    sessionId,
    courseSession,
    loadCourseSession,
    isAllowedToCancelStudents,
  };
}
