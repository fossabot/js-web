import { isAfter } from 'date-fns';
import { useRouter } from 'next/router';
import { Dispatch, SetStateAction, useState } from 'react';

import { centralHttp } from '../http';
import { useModal } from '../ui-kit/Modal';
import API_PATHS from '../constants/apiPaths';
import { Language } from '../models/language';
import WEB_PATHS from '../constants/webPaths';
import { ERROR_CODES } from '../constants/errors';
import { ICourseOutline, ICourseSession } from '../models/course';
import { usePlanUpgradeModal } from '../ui-kit/PlanUpgradeModal';
import { IEnrolledStatus } from '../course-detail/CourseDetailPage';

export type CourseSessionToBook = Partial<ICourseSession>;

interface IUseBookSession {
  setSessions: Dispatch<SetStateAction<CourseSessionToBook[] | any>>;
  outline?: ICourseOutline<Language>;
}

export const useBookSession = ({ setSessions, outline }: IUseBookSession) => {
  const [modalData, setModalData] = useState(null);
  const [enrolledStatus, setEnrolledStatus] =
    useState<IEnrolledStatus | null>(null);
  const [showPreRequisiteCourseModal, setShowPreRequisiteCourseModal] =
    useState(false);

  const reviewBookingModalProps = useModal();
  const noAvailableSeatsModalProps = useModal();
  const membershipExpireBookingModalProps = useModal();
  const preBookModalProps = useModal();
  const preBookTimeMismatchModalProps = useModal();
  const planUpgradeModalProps = usePlanUpgradeModal();
  const overlapSessionModalProps = useModal();

  const router = useRouter();

  const [sessionToBook, setSessionToBook] =
    useState<{
      session: CourseSessionToBook;
      outline: ICourseOutline<Language>;
    } | null>(null);

  const handleEnrollCourse = async (courseId: string) => {
    const { data } = await centralHttp.post(
      API_PATHS.COURSE_ENROLL.replace(':id', courseId),
    );

    if (!data?.data.success) {
      setShowPreRequisiteCourseModal(true);
      setEnrolledStatus(data?.data);
      throw new Error('Enrolled Failed');
    } else {
      setSessions((sessions) =>
        sessions
          ? sessions.map((_session) =>
              _session.courseId === courseId
                ? {
                    ..._session,
                    isEnrolled: true,
                  }
                : _session,
            )
          : sessions,
      );
    }
  };

  const handleBookCourseSession = async (session: CourseSessionToBook) => {
    const now = new Date();
    const sessionStartTime = new Date(session.startDateTime);

    if (isAfter(now, sessionStartTime)) {
      // manual rerender to disable session from UI
      setSessions((sessions) => (sessions ? [...sessions] : sessions));
      return;
    }

    try {
      if (!session.isEnrolled && session.courseId)
        await handleEnrollCourse(session.courseId);

      await centralHttp.post(
        API_PATHS.COURSE_SESSION_VALIDATE.replace(':id', session.id),
      );

      let outlineToBook = outline;
      if (!outlineToBook) {
        const { data } = await centralHttp.get<{
          data: ICourseOutline<Language>;
        }>(
          API_PATHS.COURSE_OUTLINE_DETAIL.replace(
            ':id',
            session.courseOutlineId,
          ),
        );
        outlineToBook = data.data;
      }
      reviewBookingModalProps.toggle();
      setSessionToBook({ session, outline: outlineToBook });
    } catch (err) {
      switch (err?.response?.data?.code) {
        case ERROR_CODES.SUBSCRIPTION_WILL_EXPIRE.code: {
          membershipExpireBookingModalProps.toggle();
          break;
        }

        case ERROR_CODES.PREVIOUS_OUTLINE_NOT_BOOKED.code: {
          setModalData(err.response.data.data);
          preBookModalProps.toggle();
          break;
        }

        case ERROR_CODES.SESSION_BOOKING_NOT_ALLOWED_BEFORE_PRE_BOOKING.code: {
          setModalData(err.response.data.data);
          preBookTimeMismatchModalProps.toggle();
          break;
        }

        case ERROR_CODES.INVALID_SUBSCRIPTION.code: {
          planUpgradeModalProps.setCheapestPlan(
            err?.response?.data?.data?.cheapestPlan || null,
          );
          planUpgradeModalProps.setCanUpgrade(
            err?.response?.data?.data?.canUpgrade || false,
          );
          planUpgradeModalProps.toggle();
          break;
        }

        case ERROR_CODES.SESSION_BOOKING_OVERLAP.code: {
          setModalData(err.response.data.data);
          overlapSessionModalProps.toggle();
          break;
        }
      }
      console.error(err);
    }
  };

  const handleCancelBookCourseSession = () => {
    reviewBookingModalProps.toggle();
    setTimeout(() => {
      setSessionToBook(null);
    }, 200);
  };

  const bookSession = async (session: CourseSessionToBook) => {
    const now = new Date();
    const sessionStartTime = new Date(session.startDateTime);

    // TODO: I guess handle this better with a toast/notification as it
    // would currently just close the modal and disable the session
    if (isAfter(now, sessionStartTime)) {
      // manual rerender to disable session from UI

      setSessions((sessions) => (sessions ? [...sessions] : sessions));
      handleCancelBookCourseSession();
      return;
    }

    try {
      const response = await centralHttp.post(
        API_PATHS.BOOK_COURSE_SESSION.replace(':id', session.id),
      );
      setSessions((sessions) =>
        sessions
          ? sessions.map((_session) =>
              _session.id === session.id
                ? {
                    ..._session,
                    isBooked: true,
                    availableSeats: _session.availableSeats - 1,
                  }
                : _session,
            )
          : sessions,
      );

      await router.push(
        WEB_PATHS.COURSE_SESSION_BOOKING.replace(
          ':bookingId',
          response.data.data.id,
        ),
      );
    } catch (err) {
      console.error(err.response);
      if (err?.response?.data?.code === 'NO_AVAILABLE_SEATS') {
        noAvailableSeatsModalProps.toggle();
        // manually update local state to reflect error
        setSessions((sessions) =>
          sessions.map((session) =>
            sessionToBook.session.id === session.id
              ? { ...session, availableSeats: 0 }
              : session,
          ),
        );
      }
      throw err;
    }
  };

  const handleConfirmBookCourseSession = async () => {
    if (!sessionToBook) return;

    try {
      await bookSession(sessionToBook.session);
    } catch (error) {
      handleCancelBookCourseSession();
    }
  };

  const handleOverlapBookingSession = async () => {
    const { session, overlapSession } = modalData;
    await centralHttp.delete(
      API_PATHS.BOOK_COURSE_SESSION.replace(
        ':id',
        overlapSession.courseSessionId,
      ),
    );
    setSessionToBook({ session, outline });
    try {
      await bookSession(session);
    } catch (err) {
      overlapSessionModalProps.toggle();
    }
  };

  return {
    reviewBookingModalProps,
    noAvailableSeatsModalProps,
    membershipExpireBookingModalProps,
    handleBookCourseSession,
    handleCancelBookCourseSession,
    sessionToBook,
    setSessionToBook,
    handleConfirmBookCourseSession,
    modalData,
    setModalData,
    preBookModalProps,
    preBookTimeMismatchModalProps,
    planUpgradeModalProps,
    overlapSessionModalProps,
    handleOverlapBookingSession,
    showPreRequisiteCourseModal,
    enrolledStatus,
    setShowPreRequisiteCourseModal,
  };
};
