import cx from 'classnames';
import { format } from 'date-fns';
import router from 'next/router';
import { FC, Fragment, useEffect, useMemo } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import PreRequisiteCourseModal from '../course-detail/PreRequisiteCourseModal';
import { MembershipExpireBookingModal } from '../course-session/MembershipExpireBookingModal';
import { NoAvailableSeatsModal } from '../course-session/NoAvailableSeatsModal';
import { OverlapSessionModal } from '../course-session/OverlapSessionModal';
import PreBookCourseSessionModal from '../course-session/PreBookCourseSessionModal';
import PreBookCourseSessionTimeMismatchModal from '../course-session/PreBookCourseSessionTimeMismatchModal';
import { ReviewBookingModal } from '../course-session/ReviewBookingModal';
import { EventCalendarEmpty } from '../event-calendar/EventCalendarEmpty';
import { EventCalendarMobileFilters } from '../event-calendar/EventCalendarMobileFilters';
import { EventCalendarSideFilters } from '../event-calendar/EventCalendarSideFilters';
import { useBookSession } from '../hooks/useBookSession';
import { useSessionCalendar } from '../hooks/useSessionCalendar';
import Layout from '../layouts/main.layout';
import { ITokenProps } from '../models/auth';
import { ICourseSession } from '../models/course';
import SessionCardSkeleton from '../shared/skeletons/SessionCardSkeleton';
import Backdrop from '../ui-kit/Backdrop';
import MainNavBar from '../ui-kit/headers/MainNavbar';
import PlanUpgradeModal from '../ui-kit/PlanUpgradeModal';
import { SystemError } from '../ui-kit/SystemError';
import { UpcomingSessionDatePeriod } from './UpcomingSessionDatePeriod';
import { UpcomingSessionTopFilter } from './UpcomingSessionTopFilters';

interface IUpcomingSessionSection {
  instructorId: string;
  token: ITokenProps;
}

const UpcomingSessionSection: FC<IUpcomingSessionSection> = ({
  instructorId,
  token,
}) => {
  const {
    allowedDates,
    date,
    setDate,
    learningStyle,
    setLearningStyle,
    setView,
    view,
    sessions: calendarSessions,
    setSessions: setCalendarSessions,
    isLoading,
    onClear,
    error,
  } = useSessionCalendar(
    // needs to be memoized to not let useSessionCalendar deps have new objects on each render
    useMemo(
      () => ({
        calendarInstructorId: instructorId,
        instructorIds: [instructorId],
        calendarFields: ['courseOutlineCategory'],
      }),
      [instructorId],
    ),
  );

  const {
    handleBookCourseSession,
    handleCancelBookCourseSession,
    handleConfirmBookCourseSession,
    membershipExpireBookingModalProps,
    noAvailableSeatsModalProps,
    reviewBookingModalProps,
    sessionToBook,
    modalData,
    setModalData,
    preBookModalProps,
    preBookTimeMismatchModalProps,
    planUpgradeModalProps,
    overlapSessionModalProps,
    handleOverlapBookingSession,
    enrolledStatus,
    showPreRequisiteCourseModal,
    setShowPreRequisiteCourseModal,
  } = useBookSession({
    setSessions: setCalendarSessions,
  });

  useEffect(() => {
    if (view === 'sessions') {
      window.scrollTo(0, 0);
    }
  }, [view, date, learningStyle]);

  const sessionMap = useMemo(() => {
    const sessionMap: {
      [monthYear: string]: {
        [date: number]: ICourseSession[];
      };
    } = {};

    if (calendarSessions === null) return null;

    for (const session of calendarSessions) {
      const sessionStartTime = new Date(session.startDateTime);

      const appendSession = () => {
        if (
          learningStyle !== null &&
          learningStyle !== session.courseOutlineCategory.key
        ) {
          return;
        }

        const monthString = format(sessionStartTime, 'MM-yyyy');
        if (sessionMap[monthString] === undefined) {
          sessionMap[monthString] = {};
        }

        const sessionDate = format(sessionStartTime, 'dd');

        if (sessionMap[monthString][sessionDate] === undefined)
          sessionMap[monthString][sessionDate] = [];

        sessionMap[monthString][sessionDate].push(session);
      };

      appendSession();
    }

    return sessionMap;
  }, [calendarSessions, learningStyle]);

  const renderSessions = (
    <div className="w-full flex-1 lg:ml-8 lg:w-181 lg:space-y-6">
      {isLoading ? (
        <>
          <SessionCardSkeleton hideTopBar={true} />
          <SessionCardSkeleton hideTopBar={true} cards={1} />
        </>
      ) : Object.keys(sessionMap || {})?.length === 0 ? (
        <EventCalendarEmpty
          hasFilters={instructorId !== null || learningStyle !== null}
          onClear={onClear}
        />
      ) : (
        Object.keys(sessionMap || {})
          .sort()
          .map((monthString) => {
            const [month, year] = monthString.split('-');

            return (
              <Fragment key={monthString}>
                {Object.keys(sessionMap[monthString])
                  .sort()
                  .map((sessionDate) => {
                    const dateString = `${year}-${month}-${sessionDate}`;

                    if (sessionMap[monthString][sessionDate].length === 0)
                      return null;

                    return (
                      <Fragment key={sessionDate}>
                        <UpcomingSessionDatePeriod
                          headingContent={
                            <h3
                              className={cx(
                                'text-subheading font-bold text-gray-650',
                              )}
                            >
                              {format(new Date(dateString), 'EEEE d MMMM yyyy')}
                            </h3>
                          }
                          sessions={sessionMap[monthString][sessionDate]}
                          handleBookCourseSession={handleBookCourseSession}
                        />
                      </Fragment>
                    );
                  })}
              </Fragment>
            );
          })
      )}
    </div>
  );

  const renderSideFilters = (
    <EventCalendarSideFilters
      {...{
        className: 'hidden lg:block',
        date: calendarSessions ? date : null,
        setDate: (date: Date) => setDate(date),
        learningStyle,
        setLearningStyle,
        allowedDates,
        setView,
        hideButtons: true,
        isLoading: !sessionMap,
      }}
    />
  );

  const renderSideMobileFilters = (
    <EventCalendarSideFilters
      {...{
        className: 'py-6',
        date: calendarSessions ? date : null,
        setDate: (date: Date) => setDate(date),
        allowedDates,
        setView,
        hideButtons: true,
      }}
    />
  );

  const renderTopFilters = (
    <UpcomingSessionTopFilter
      {...{
        calendarSessions,
        instructorId,
        setLearningStyle,
        learningStyle,
        onClear,
        setView,
      }}
    />
  );

  if (error)
    return (
      <Layout noMobilePadding header={<MainNavBar token={token} />}>
        <SystemError resetError={router.reload} error={error} />
      </Layout>
    );

  return (
    <>
      <div className="relative w-full flex-row bg-white lg:mx-auto lg:mb-6 lg:mt-6 lg:w-244 lg:rounded-t-3xl">
        <EventCalendarMobileFilters
          {...{
            isLoading: !sessionMap,
            view,
            setView,
            date,
            isFixedMobile: view !== 'sessions',
            className: 'lg:hidden',
          }}
        />
        <div className="flex flex-row items-start">
          <div className="lg:h-76vh static lg:sticky lg:top-40">
            <PerfectScrollbar className="lg:pb-1px">
              {renderSideFilters}
            </PerfectScrollbar>
          </div>
          {renderSessions}
        </div>
        <div className="flex flex-col items-start lg:hidden">
          <div
            className="fixed z-40 flex w-full flex-col items-start bg-white lg:hidden"
            style={{ top: 121 }}
          >
            {view === 'top-filters' && renderTopFilters}
            {view === 'side-filters' && renderSideMobileFilters}
          </div>
          <Backdrop
            show={view !== 'sessions'}
            onClick={() => setView('sessions')}
            style={{ zIndex: 30 }}
          />
        </div>
      </div>
      <ReviewBookingModal
        {...{
          ...reviewBookingModalProps,
          session: sessionToBook?.session,
          outline: sessionToBook?.outline,
          onConfirm: handleConfirmBookCourseSession,
          onCancel: handleCancelBookCourseSession,
        }}
      />
      <MembershipExpireBookingModal {...membershipExpireBookingModalProps} />
      <NoAvailableSeatsModal {...{ ...noAvailableSeatsModalProps }} />
      <PreBookCourseSessionModal
        {...{
          ...preBookModalProps,
          onClose: () => setModalData(null),
          courseOutline: modalData,
        }}
      />
      <PreBookCourseSessionTimeMismatchModal
        {...{
          ...preBookTimeMismatchModalProps,
          onClose: () => setModalData(null),
          courseOutline: modalData,
        }}
      />
      <PlanUpgradeModal {...planUpgradeModalProps} />
      <OverlapSessionModal
        {...{
          ...overlapSessionModalProps,
          onClose: () => setModalData(null),
          modalData,
          onOk: handleOverlapBookingSession,
        }}
      />
      <PreRequisiteCourseModal
        course={enrolledStatus?.preRequisiteCourse}
        showPreRequisiteModal={showPreRequisiteCourseModal}
        setShowPreRequisiteModal={setShowPreRequisiteCourseModal}
      />
    </>
  );
};

export default UpcomingSessionSection;
