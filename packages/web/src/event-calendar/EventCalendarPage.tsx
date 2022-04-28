import cx from 'classnames';
import { format, isWithinInterval, set } from 'date-fns';
import Head from 'next/head';
import { Fragment, useEffect, useMemo } from 'react';
import Layout from '../layouts/main.layout';
import { ITokenProps } from '../models/auth';
import useTranslation from '../i18n/useTranslation';
import { useResponsive } from '../hooks/useResponsive';
import { useBookSession } from '../hooks/useBookSession';
import { ReviewBookingModal } from '../course-session/ReviewBookingModal';
import { NoAvailableSeatsModal } from '../course-session/NoAvailableSeatsModal';
import PreBookCourseSessionModal from '../course-session/PreBookCourseSessionModal';
import { MembershipExpireBookingModal } from '../course-session/MembershipExpireBookingModal';
import PreBookCourseSessionTimeMismatchModal from '../course-session/PreBookCourseSessionTimeMismatchModal';
import { ICourseSessionCalendar } from '../models/course';
import MainNavBar from '../ui-kit/headers/MainNavbar';
import { EventCalendarEmpty } from './EventCalendarEmpty';
import { EventCalendarDayPeriod } from './EventCalendarDayPeriod';
import { EventCalendarTopFilters } from './EventCalendarTopFilters';
import { EventCalendarSideFilters } from './EventCalendarSideFilters';
import { EventCalendarMobileFilters } from './EventCalendarMobileFilters';
import PlanUpgradeModal from '../ui-kit/PlanUpgradeModal';
import { OverlapSessionModal } from '../course-session/OverlapSessionModal';
import SessionCardSkeleton from '../shared/skeletons/SessionCardSkeleton';
import PreRequisiteCourseModal from '../course-detail/PreRequisiteCourseModal';
import {
  useSessionCalendar,
  DayPeriod,
  dayPeriodCutOff,
} from '../hooks/useSessionCalendar';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';
import { SystemError } from '../ui-kit/SystemError';
import { useRouter } from 'next/router';

interface IEventCalendarPageProps {
  token: ITokenProps;
}

export const EventCalendarPage = ({ token }: IEventCalendarPageProps) => {
  const { lg } = useResponsive();
  const { t } = useTranslation();
  const router = useRouter();

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
    topic,
    setTopic,
    onClear,
    instructorId,
    setInstructorId,
    dayPeriod,
    setDayPeriod,
    error,
  } = useSessionCalendar({
    calendarFields: [
      'courseOutlineCategory',
      'courseTopics',
      'courseOutlineLearningWay',
      'instructors',
    ],
  });

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
    setShowPreRequisiteCourseModal,
    showPreRequisiteCourseModal,
  } = useBookSession({
    setSessions: setCalendarSessions,
  });

  useEffect(() => {
    if (lg) {
      setView('sessions');
    }
  }, [lg]);

  useEffect(() => {
    if (view === 'sessions') {
      window.scrollTo(0, 0);
    }
  }, [view, date, topic, instructorId, dayPeriod]);

  const sessionMap = useMemo(() => {
    const sessionMap: {
      [monthYear: string]: {
        [date: number]: {
          [dayPeriod in
            | 'morning'
            | 'afternoon'
            | 'evening']: ICourseSessionCalendar[];
        };
      };
    } = {};

    if (calendarSessions === null) return null;

    for (const session of calendarSessions) {
      if (
        learningStyle !== null &&
        learningStyle !== session.courseOutlineCategory.key
      ) {
        continue;
      }

      if (instructorId !== null) {
        if (
          !session.instructors
            .map((instructor) => instructor.id)
            .includes(instructorId)
        )
          continue;
      }

      if (topic !== null) {
        if (
          topic.type === 'learningWay' &&
          session.courseOutlineLearningWay.id !== topic.value
        ) {
          continue;
        }

        if (
          topic.type === 'topic' &&
          !session.courseTopics.map((topic) => topic.id).includes(topic.value)
        ) {
          continue;
        }
      }

      const sessionStartTime = new Date(session.startDateTime);

      const appendSession = (dayPeriod: DayPeriod) => {
        const monthString = format(sessionStartTime, 'MM-yyyy');
        if (sessionMap[monthString] === undefined) {
          sessionMap[monthString] = {};
        }

        const sessionDate = format(sessionStartTime, 'dd');

        if (sessionMap[monthString][sessionDate] === undefined) {
          sessionMap[monthString][sessionDate] = {
            morning: [],
            afternoon: [],
            evening: [],
          };
        }

        sessionMap[monthString][sessionDate][dayPeriod].push(session);
      };

      Object.keys(dayPeriodCutOff).forEach((dp: DayPeriod) => {
        const isInInterval = isWithinInterval(sessionStartTime, {
          start: set(sessionStartTime, {
            hours: dayPeriodCutOff[dp].start.hour,
            minutes: dayPeriodCutOff[dp].start.minute,
          }),
          end: set(sessionStartTime, {
            hours: dayPeriodCutOff[dp].end.hour,
            minutes: dayPeriodCutOff[dp].end.minute,
          }),
        });

        if (isInInterval && (dayPeriod === dp || dayPeriod === null))
          appendSession(dp);
      });
    }

    return sessionMap;
  }, [calendarSessions, learningStyle, dayPeriod, instructorId, topic]);

  const renderSessions = (
    <div className="mb-8 w-full flex-1 space-y-6 lg:mb-0 lg:ml-8 lg:w-181">
      {isLoading ? (
        <>
          <SessionCardSkeleton />
          <SessionCardSkeleton cards={1} />
        </>
      ) : Object.keys(sessionMap || {})?.length === 0 ? (
        <EventCalendarEmpty
          hasFilters={
            topic !== null ||
            instructorId !== null ||
            dayPeriod !== null ||
            learningStyle !== null
          }
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

                    if (
                      sessionMap[monthString][sessionDate].morning.length ===
                        0 &&
                      sessionMap[monthString][sessionDate].afternoon.length ===
                        0 &&
                      sessionMap[monthString][sessionDate].evening.length === 0
                    )
                      return null;

                    return (
                      <Fragment key={sessionDate}>
                        <h2
                          data-event-calendar-section={dateString}
                          className={cx(
                            'block px-6 text-subtitle font-semibold lg:px-0',
                          )}
                        >
                          {format(new Date(dateString), 'EEEE d MMMM yyyy')}
                        </h2>
                        <EventCalendarDayPeriod
                          dayPeriod="morning"
                          sessions={
                            sessionMap[monthString][sessionDate].morning
                          }
                          topic={topic}
                          instructorId={instructorId}
                          handleBookCourseSession={handleBookCourseSession}
                        />
                        <EventCalendarDayPeriod
                          dayPeriod="afternoon"
                          sessions={
                            sessionMap[monthString][sessionDate].afternoon
                          }
                          topic={topic}
                          instructorId={instructorId}
                          handleBookCourseSession={handleBookCourseSession}
                        />
                        <EventCalendarDayPeriod
                          dayPeriod="evening"
                          sessions={
                            sessionMap[monthString][sessionDate].evening
                          }
                          topic={topic}
                          instructorId={instructorId}
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

  const renderTopFilters = (
    <EventCalendarTopFilters
      {...{
        calendarSessions,
        instructorId,
        setInstructorId,
        topic,
        setTopic,
        onClear,
        setView,
      }}
    />
  );

  const renderSideFilters = (
    <EventCalendarSideFilters
      {...{
        isLoading: !sessionMap,
        date: calendarSessions ? date : null,
        setDate: (date: Date) => setDate(date),
        learningStyle,
        setLearningStyle,
        dayPeriod,
        setDayPeriod,
        allowedDates,
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
      <Head>
        <title>
          {t('headerText')} | {t('eventCalendarPage.title')}
        </title>
      </Head>
      <Layout
        noMobilePadding
        header={
          <>
            <MainNavBar token={token} />
            {lg ? (
              renderTopFilters
            ) : (
              <EventCalendarMobileFilters {...{ view, setView, date }} />
            )}
          </>
        }
      >
        <div className="relative z-10 w-full bg-white pt-20 lg:my-8 lg:mx-auto lg:w-244 lg:rounded-t-3xl lg:px-6 lg:pt-0">
          <div className="hidden flex-row items-start lg:flex">
            <div className="static lg:sticky lg:top-40 lg:h-78vh">
              <PerfectScrollbar className="lg:pb-1px">
                {renderSideFilters}
              </PerfectScrollbar>
            </div>
            {renderSessions}
          </div>
          <div className="flex flex-col items-start pb-10 lg:hidden">
            {view === 'sessions' && renderSessions}
            {view === 'top-filters' && renderTopFilters}
            {view === 'side-filters' && renderSideFilters}
          </div>
        </div>
      </Layout>
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
