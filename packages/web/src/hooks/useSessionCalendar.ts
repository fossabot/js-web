import {
  endOfDay,
  isSameDay,
  isSameMonth,
  isSameYear,
  isWithinInterval,
  set,
  startOfDay,
} from 'date-fns';
import { useCallback, useEffect, useState } from 'react';

import { centralHttp } from '../http';
import API_PATHS from '../constants/apiPaths';
import {
  CourseSubCategoryKey,
  ICourseSession,
  ICourseSessionCalendar,
  ICourseSessionInstructor,
} from '../models/course';
import { BaseResponseDto } from '../models/BaseResponse.dto';
import { unstable_batchedUpdates } from 'react-dom';
import { captureError } from '../utils/error-routing';

export type LearningStyle =
  | CourseSubCategoryKey.FACE_TO_FACE
  | CourseSubCategoryKey.VIRTUAL
  | null;

export type TopicFilter =
  | { type: 'topic'; value: string }
  | { type: 'learningWay'; value: string }
  | null;

export type EventCalendarView = 'sessions' | 'side-filters' | 'top-filters';

export type DayPeriod = 'morning' | 'afternoon' | 'evening' | null;

export const dayPeriodCutOff = {
  morning: { start: { hour: 0, minute: 0 }, end: { hour: 11, minute: 59 } },
  afternoon: { start: { hour: 12, minute: 0 }, end: { hour: 17, minute: 59 } },
  evening: { start: { hour: 18, minute: 0 }, end: { hour: 23, minute: 59 } },
};

const SessionCalendarQueryFields = [
  'courseOutlineTitle',
  'courseOutlineCategory',
  'courseOutlineLearningWay',
  'instructors',
  'availableSeats',
  'isBooked',
  'courseTitle',
  'courseTopics',
  'hasCertificate',
  'courseImageKey',
] as const;

export type ISessionCalendarQueryFields =
  typeof SessionCalendarQueryFields[number];

interface IUseSessionCalendar {
  calendarInstructorId?: string;
  courseOutlineId?: string;
  instructorIds?: string[];
  calendarFields?: ISessionCalendarQueryFields[];
  onlyEnrolled?: boolean;
  calendarDeps?: any[];
}

export const useSessionCalendar = ({
  calendarInstructorId,
  courseOutlineId,
  instructorIds,
  calendarFields,
  onlyEnrolled = false,
  calendarDeps = [],
}: IUseSessionCalendar) => {
  const [isLoading, setLoading] = useState<boolean>(true);
  const [language, setLanguage] = useState<'any' | 'en' | 'th'>('any');
  const [calendarDates, setCalendarDates] =
    useState<ICourseSessionCalendar[] | null>(null);
  const [learningStyle, setLearningStyle] =
    useState<LearningStyle | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [view, setView] = useState<EventCalendarView>('sessions');
  const [sessions, setSessions] = useState<ICourseSession[] | null>(null);
  const [topic, setTopic] = useState<TopicFilter>(null);
  const [instructorId, setInstructorId] =
    useState<ICourseSessionInstructor['id'] | null>(null);
  const [dayPeriod, setDayPeriod] = useState<DayPeriod>(null);
  const [error, setError] = useState<Error | undefined>();

  const findFirstSession = useCallback(
    (calendarDates: ICourseSessionCalendar[], courseOutlineId: string) => {
      if (calendarDates?.length > 0) {
        if (courseOutlineId) {
          const firstSessionOfOutline = calendarDates.find(
            (cal) => cal.courseOutlineId === courseOutlineId,
          );

          firstSessionOfOutline
            ? setDate(new Date(firstSessionOfOutline.startDateTime))
            : setDate(new Date());
        } else if (!date) {
          setDate(new Date(calendarDates[0].startDateTime));
        }
      }
    },
    [date],
  );

  useEffect(() => {
    async function fetchCalendarDates() {
      try {
        const { data } = await centralHttp.get<
          BaseResponseDto<ICourseSessionCalendar[]>
        >(API_PATHS.COURSE_SESSIONS_CALENDAR, {
          params: {
            instructorId: calendarInstructorId,
            onlyEnrolled,
            fields: calendarFields,
          },
        });

        const calendarDates = data.data;

        unstable_batchedUpdates(() => {
          findFirstSession(calendarDates, courseOutlineId);
          setCalendarDates(calendarDates);
        });
      } catch (error) {
        setError(error);
        captureError(error);
      }
    }

    fetchCalendarDates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...calendarDeps]);

  useEffect(() => {
    async function fetchSession() {
      try {
        setLoading(true);
        const { data } = await centralHttp.get<
          BaseResponseDto<ICourseSession[]>
        >(API_PATHS.COURSE_SESSIONS, {
          params: {
            startTime: startOfDay(date).toJSON(),
            endTime: endOfDay(date).toJSON(),
            courseOutlineId,
            instructorIds: instructorIds ?? [],
            language: language === 'any' ? undefined : language,
          },
        });

        setSessions(data.data);
      } catch (error) {
        setError(error);
        captureError(error);
      } finally {
        setLoading(false);
      }
    }

    if (date && calendarDates?.length > 0) {
      fetchSession();
    } else if (calendarDates?.length === 0) {
      setSessions([]);
      setLoading(false);
    }
  }, [date, language, calendarDates, courseOutlineId, instructorIds]);

  const allowedDates = useCallback(
    (date: Date) => {
      return !!calendarDates?.find((booking) => {
        const startDate = new Date(booking.startDateTime);
        const isAllowed = [
          isSameDay(startDate, date),
          isSameMonth(startDate, date),
          isSameYear(startDate, date),
        ];

        if (topic) {
          if (topic.type === 'learningWay')
            isAllowed.push(booking.courseOutlineLearningWay.id === topic.value);
          if (topic.type === 'topic')
            isAllowed.push(
              !!booking.courseTopics.find((ct) => ct.id === topic.value),
            );
        }

        if (instructorId)
          isAllowed.push(
            !!booking.instructors.find((i) => i.id === instructorId),
          );

        if (learningStyle)
          isAllowed.push(booking.courseOutlineCategory.key === learningStyle);

        if (dayPeriod)
          isAllowed.push(
            isWithinInterval(startDate, {
              start: set(startDate, {
                hours: dayPeriodCutOff[dayPeriod].start.hour,
                minutes: dayPeriodCutOff[dayPeriod].start.minute,
              }),
              end: set(startDate, {
                hours: dayPeriodCutOff[dayPeriod].end.hour,
                minutes: dayPeriodCutOff[dayPeriod].end.minute,
              }),
            }),
          );

        if (language !== 'any') isAllowed.push(booking.language === language);

        if (courseOutlineId)
          isAllowed.push(booking.courseOutlineId === courseOutlineId);

        return isAllowed.every((bool) => bool === true);
      });
    },
    [
      calendarDates,
      topic,
      instructorId,
      learningStyle,
      dayPeriod,
      language,
      courseOutlineId,
    ],
  );

  useEffect(() => {
    if (date && !allowedDates(date) && sessions?.length > 0) {
      const startDate = new Date(sessions[0].startDateTime);
      const isAllowed = [
        isSameDay(startDate, date),
        isSameMonth(startDate, date),
        isSameYear(startDate, date),
      ];

      if (isAllowed.some((bool) => bool === false))
        setDate(new Date(sessions[0].startDateTime));
      else setDate(null);
    }
  }, [date, allowedDates, sessions]);

  const onClear = useCallback(() => {
    unstable_batchedUpdates(() => {
      setLearningStyle(null);
      setTopic(null);
      setInstructorId(null);
      setDayPeriod(null);
      findFirstSession(calendarDates, courseOutlineId);
    });
  }, [findFirstSession, calendarDates, courseOutlineId]);

  return {
    allowedDates,
    date,
    setDate,
    view,
    setView,
    setLearningStyle,
    learningStyle,
    sessions,
    setSessions,
    isLoading,
    setLanguage,
    language,
    onClear,
    topic,
    setTopic,
    instructorId,
    setInstructorId,
    dayPeriod,
    setDayPeriod,
    calendarDates,
    setLoading,
    error,
  };
};
