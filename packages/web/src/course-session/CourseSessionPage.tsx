import Head from 'next/head';
import { stringifyUrl } from 'query-string';
import { useRouter } from 'next/router';
import { isWithinInterval, set } from 'date-fns';
import { useEffect, useMemo, useRef, useState } from 'react';

import Layout from '../layouts/main.layout';
import { ITokenObject } from '../models/auth';
import WEB_PATHS from '../constants/webPaths';
import API_PATHS from '../constants/apiPaths';
import { ERROR_CODES } from '../constants/errors';
import useTranslation from '../i18n/useTranslation';
import { centralHttp } from '../http';
import { useLocaleText } from '../i18n/useLocaleText';
import { useBookSession } from '../hooks/useBookSession';
import { BaseResponseDto } from '../models/BaseResponse.dto';
import { ICourseOutline, ICourseSession } from '../models/course';
import { Language } from '../models/language';
import MainNavBar from '../ui-kit/headers/MainNavbar';
import { CourseSessionEmpty } from './CourseSessionEmpty';
import { ReviewBookingModal } from './ReviewBookingModal';
import { Afternoon, Evening, Morning } from '../ui-kit/icons';
import { CourseSessionFilters } from './CourseSessionFilters';
import { CourseSessionCalendar } from './CourseSessionCalendar';
import { NoAvailableSeatsModal } from './NoAvailableSeatsModal';
import PreBookCourseSessionModal from './PreBookCourseSessionModal';
import { CourseSessionDaypartSection } from './CourseSessionDaypartSection';
import { MembershipExpireBookingModal } from './MembershipExpireBookingModal';
import PreBookCourseSessionTimeMismatchModal from './PreBookCourseSessionTimeMismatchModal';
import PlanUpgradeModal from '../ui-kit/PlanUpgradeModal';
import { OverlapSessionModal } from './OverlapSessionModal';
import { SystemError } from '../ui-kit/SystemError';
import {
  dayPeriodCutOff,
  useSessionCalendar,
} from '../hooks/useSessionCalendar';
import { unstable_batchedUpdates } from 'react-dom';
import { UserUpcomingBooking } from '../models/course-session';
import CourseSessionUpcomingBooking from './CourseSessionUpcomingBooking';

interface ICourseSessionPageProps {
  token: ITokenObject;
}
function CourseSessionPage({ token }: ICourseSessionPageProps) {
  const router = useRouter();
  const localeText = useLocaleText();
  const { t } = useTranslation();

  const showCalendarButtonRef = useRef(null);

  const [instructorIds, setInstructorIds] = useState<string[]>([]);
  const [courseOutlines, setCourseOutlines] = useState<
    ICourseOutline<Language>[]
  >([]);
  const [courseOutline, setCourseOutline] =
    useState<ICourseOutline<Language> | undefined>();
  const [error, setError] = useState<Error | undefined>();
  const [isDelayed, setDelayed] = useState<boolean>(true);
  const [upcomingBookings, setUpcomingBookings] = useState<
    UserUpcomingBooking[]
  >([]);

  const {
    date: currDate,
    setDate: setCurrDate,
    calendarDates: calendarSessions,
    isLoading,
    language,
    setLanguage,
    sessions: courseSessions,
    setSessions: setCourseSessions,
    allowedDates,
    error: calendarError,
  } = useSessionCalendar({
    calendarFields: [
      'courseOutlineCategory',
      'courseTopics',
      'courseOutlineLearningWay',
      'instructors',
    ],
    onlyEnrolled: true,
    instructorIds,
    courseOutlineId: router.query.id as string,
    calendarDeps: [router.query.id],
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
  } = useBookSession({
    setSessions: setCourseSessions,
    outline: courseOutline,
  });

  const initializeCourseOutline = async () => {
    let courseId;

    try {
      const courseOutlineId = router.query.id as string;

      const [{ data }] = await Promise.all([
        centralHttp.get<{
          data: ICourseOutline<Language>;
        }>(API_PATHS.COURSE_OUTLINE_DETAIL.replace(':id', courseOutlineId)),
        ,
        centralHttp.post(
          API_PATHS.COURSE_OUTLINE_VALIDATE.replace(':id', courseOutlineId),
        ),
      ]);

      const courseOutline = data.data;
      courseId = courseOutline.courseId;

      if (!courseOutline.isBookingEligible) {
        router.replace(WEB_PATHS.COURSE_DETAIL.replace(':id', courseId));
        return;
      }

      const [{ data: outlinesData }, { data: upcomingBookingData }] =
        await Promise.all([
          centralHttp.get<BaseResponseDto<ICourseOutline<Language>[]>>(
            API_PATHS.COURSE_ID_COURSE_OUTLINES.replace(
              ':id',
              courseOutline.courseId,
            ),
          ),
          centralHttp.get<BaseResponseDto<UserUpcomingBooking[]>>(
            API_PATHS.COURSE_SESSIONS_UPCOMING_ME.replace(
              ':courseId',
              courseOutline.courseId,
            ),
          ),
        ]);

      unstable_batchedUpdates(() => {
        setCourseOutline(courseOutline);
        setCourseOutlines(outlinesData.data);
        setUpcomingBookings(upcomingBookingData.data);
      });
    } catch (err) {
      if (
        courseId &&
        err?.response?.data?.code === ERROR_CODES.INVALID_SUBSCRIPTION.code
      ) {
        router.replace(
          stringifyUrl({
            url: WEB_PATHS.COURSE_DETAIL.replace(':id', courseId),
            query: {
              needPlanId: err?.response?.data?.data?.cheapestPlan.id || null,
              canUpgrade: err?.response?.data?.data?.canUpgrade,
            },
          }),
        );
      } else throw err;
    }
  };

  const initialize = () => {
    setError(undefined);
    initializeCourseOutline().catch(setError);
  };

  useEffect(() => {
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.asPath]);

  useEffect(() => {
    setDelayed(true);
    // Add a bit of a delay to prevent no session symbol pop up before going to first date of the outline session
    const delayFn = setTimeout(() => setDelayed(false), 500);

    return () => clearTimeout(delayFn);
  }, [courseOutline, router.query.id]);

  const head = useMemo(() => {
    return (
      <Head>
        <title>
          {t('headerText')}
          {courseOutline?.title ? ` | ${localeText(courseOutline?.title)}` : ''}
        </title>
      </Head>
    );
  }, [courseOutline?.title, localeText, t]);

  const { morningSessions, afternoonSessions, eveningSessions } =
    useMemo(() => {
      const morningSessions: ICourseSession[] = [];
      const afternoonSessions: ICourseSession[] = [];
      const eveningSessions: ICourseSession[] = [];

      if (courseSessions) {
        for (const session of courseSessions) {
          const sessionStartDate = new Date(session.startDateTime);

          const isInMorning = isWithinInterval(sessionStartDate, {
            start: set(sessionStartDate, {
              hours: dayPeriodCutOff['morning'].start.hour,
              minutes: dayPeriodCutOff['morning'].start.minute,
            }),
            end: set(sessionStartDate, {
              hours: dayPeriodCutOff['morning'].end.hour,
              minutes: dayPeriodCutOff['morning'].end.minute,
            }),
          });

          const isInAfternoon = isWithinInterval(sessionStartDate, {
            start: set(sessionStartDate, {
              hours: dayPeriodCutOff['afternoon'].start.hour,
              minutes: dayPeriodCutOff['afternoon'].start.minute,
            }),
            end: set(sessionStartDate, {
              hours: dayPeriodCutOff['afternoon'].end.hour,
              minutes: dayPeriodCutOff['afternoon'].end.minute,
            }),
          });

          const isInEvening = isWithinInterval(sessionStartDate, {
            start: set(sessionStartDate, {
              hours: dayPeriodCutOff['evening'].start.hour,
              minutes: dayPeriodCutOff['evening'].start.minute,
            }),
            end: set(sessionStartDate, {
              hours: dayPeriodCutOff['evening'].end.hour,
              minutes: dayPeriodCutOff['evening'].end.minute,
            }),
          });

          if (isInMorning) morningSessions.push(session);
          if (isInAfternoon) afternoonSessions.push(session);
          if (isInEvening) eveningSessions.push(session);
        }
      }

      return { morningSessions, afternoonSessions, eveningSessions };
    }, [courseSessions]);

  const eligibleCourseOutlines = useMemo(() => {
    return courseOutlines
      .filter((co) => co.category.key === courseOutline.category.key)
      .sort((a, b) => a.part - b.part)
      .filter((co) => {
        if (!co.isBookingEligible) return false;

        if (co?.availableSessionCount <= 0) return false;

        return true;
      });
  }, [courseOutlines, courseOutline]);

  if (!courseOutline && !error) return null;
  if (error || calendarError)
    return (
      <Layout
        noMobilePadding
        head={head}
        header={<MainNavBar token={{ token }} />}
      >
        <SystemError resetError={() => router.reload()} error={error} />
      </Layout>
    );

  return (
    <>
      <Layout
        noMobilePadding
        head={head}
        header={
          <>
            <MainNavBar token={{ token }} />
            <CourseSessionFilters
              {...{
                courseOutlines: eligibleCourseOutlines,
                calendarSessions,
                outlineId: courseOutline.id,
                instructorIds,
                language,
                onChangeOutline: (outlineId) => {
                  router.replace(
                    WEB_PATHS.COURSE_OUTLINE_SESSIONS.replace(':id', outlineId),
                  );
                },
                onChangeInstructors: setInstructorIds,
                onChangeLanguage: setLanguage,
              }}
            />
          </>
        }
      >
        <div className="w-full bg-white pt-12 lg:my-8 lg:mx-auto lg:w-256 lg:rounded-t-3xl lg:px-6 lg:pt-0">
          <div className="flex flex-col-reverse items-start pb-10 lg:flex-row lg:pb-0">
            <CourseSessionCalendar
              {...{
                allowedDates,
                currDate,
                setCurrDate,
                outlineId: courseOutline.id,
                calendarSessions,
                showCalendarButtonRef,
              }}
            />
            <div className="mb-8 w-full flex-1 space-y-6 lg:mb-0 lg:ml-8 lg:w-181">
              <CourseSessionUpcomingBooking bookings={upcomingBookings} />
              {!isLoading &&
                courseSessions !== null &&
                (courseSessions.length > 0 ? (
                  <>
                    {[
                      {
                        title: t('courseSessionsPage.morning'),
                        icon: Morning,
                        sessions: morningSessions,
                      },
                      {
                        title: t('courseSessionsPage.afternoon'),
                        icon: Afternoon,
                        sessions: afternoonSessions,
                      },
                      {
                        title: t('courseSessionsPage.evening'),
                        icon: Evening,
                        sessions: eveningSessions,
                      },
                    ]
                      .filter((section) => section.sessions.length > 0)
                      .map((section, index) => (
                        <CourseSessionDaypartSection
                          key={section.title}
                          title={section.title}
                          icon={section.icon}
                          sessions={section.sessions}
                          index={index}
                          handleBookCourseSession={handleBookCourseSession}
                          category={courseOutline.category.key}
                        />
                      ))}
                  </>
                ) : (
                  !isDelayed && (
                    <CourseSessionEmpty
                      showCalendarButtonRef={showCalendarButtonRef}
                      hasFilters={
                        instructorIds.length > 0 || language !== 'any'
                      }
                    />
                  )
                ))}
            </div>
          </div>
        </div>
      </Layout>
      <ReviewBookingModal
        {...{
          ...reviewBookingModalProps,
          session: sessionToBook?.session,
          outline: courseOutline,
          onConfirm: handleConfirmBookCourseSession,
          onCancel: handleCancelBookCourseSession,
        }}
      />
      <MembershipExpireBookingModal {...membershipExpireBookingModalProps} />
      <NoAvailableSeatsModal
        {...{
          ...noAvailableSeatsModalProps,
          onSelectAnotherDate: () => {
            showCalendarButtonRef.current?.click();
          },
        }}
      />
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
    </>
  );
}

export default CourseSessionPage;
