import { endOfDay, format, startOfDay } from 'date-fns';
import Head from 'next/head';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { FaCheck, FaWindowClose } from 'react-icons/fa';
import { AccessControl } from '../app-state/accessControl';
import API_PATHS from '../constants/apiPaths';
import { BACKEND_ADMIN_CONTROL } from '../constants/policies';
import { centralHttp } from '../http';
import { useLocaleText } from '../i18n/useLocaleText';
import useTranslation from '../i18n/useTranslation';
import Layout from '../layouts/main.layout';
import { ITokenProps } from '../models/auth';
import { BaseResponseDto } from '../models/BaseResponse.dto';
import {
  CourseSessionBookingStatus,
  ICourseSessionCalendar,
} from '../models/course';
import { User } from '../models/user';
import { DatePicker } from '../ui-kit/DatePicker/DatePicker';
import DropdownButton from '../ui-kit/DropdownButton';
import VirtualizedTable from '../ui-kit/VirtualizedTable';
import { CourseAttendantsTable } from './CourseAttendantsTable';
import { CourseSessionGroup } from './CourseSessionGroup';

interface ICourseAttendanceListPageProps {
  token: ITokenProps;
}

type SessionAttendant = Pick<User, 'firstName' | 'lastName' | 'email'> & {
  id: string;
  bookingStatus: CourseSessionBookingStatus;
};

export const CourseAttendanceListPage = ({
  token,
}: ICourseAttendanceListPageProps) => {
  const { t } = useTranslation();
  const localeText = useLocaleText();
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [selectedSession, setSelectedSession] =
    useState<ICourseSessionCalendar | null>(null);
  const [sessions, setSessions] = useState<ICourseSessionCalendar[]>([]);

  const [attendants, setAttendants] = useState<SessionAttendant[] | null>(null);
  const [checkedRows, setCheckedRows] = useState<string[]>([]);

  useEffect(() => {
    centralHttp
      .get<BaseResponseDto<ICourseSessionCalendar[]>>(
        API_PATHS.COURSE_SESSIONS_ATTENDANCE,
        {
          params: {
            startTime: selectedDate.toJSON(),
            endTime: endOfDay(selectedDate).toJSON(),
            fields: [
              'courseTitle',
              'courseOutlineTitle',
              'courseOutlineCategory',
              'instructors',
            ],
          },
        },
      )
      .then((res) => {
        setAttendants(null);
        setSelectedSession(null);
        setSessions(res.data.data);
      })
      .catch(console.error);
  }, [selectedDate]);

  useEffect(() => {
    setCheckedRows([]);
  }, [attendants]);

  // group them up for easier rendering
  const groupedSessions = useMemo(() => {
    const courses: {
      [courseId: string]: {
        id: string;
        title: ReactNode;
        outlines: {
          [outlineId: string]: {
            id: string;
            title: ReactNode;
            category: ReactNode;
            sessions: ICourseSessionCalendar[];
          };
        };
      };
    } = {};

    for (const session of sessions) {
      if (!courses[session.courseId])
        courses[session.courseId] = {
          id: session.courseId,
          title: localeText(session.courseTitle),
          outlines: {},
        };
      if (!courses[session.courseId].outlines[session.courseOutlineId])
        courses[session.courseId].outlines[session.courseOutlineId] = {
          id: session.courseOutlineId,
          category: session.courseOutlineCategory.key,
          title: localeText(session.courseOutlineTitle),
          sessions: [],
        };
      courses[session.courseId].outlines[session.courseOutlineId].sessions.push(
        session,
      );
    }

    return courses;
  }, [sessions]);

  useEffect(() => {
    if (selectedSession) {
      centralHttp
        .get<BaseResponseDto<SessionAttendant[]>>(
          API_PATHS.COURSE_SESSION_ATTENDANTS.replace(
            ':id',
            selectedSession.id,
          ),
        )
        .then((res) => {
          setAttendants(res.data.data);
        })
        .catch(console.error);
    }
  }, [selectedSession]);

  const updateAttendants = (
    attendantIds: string[],
    bookingStatus: CourseSessionBookingStatus,
  ) => {
    setAttendants(
      (attendants) =>
        attendants?.map((attendant) => {
          if (attendantIds.includes(attendant.id)) {
            return { ...attendant, bookingStatus };
          }
          return attendant;
        }) || null,
    );
  };

  const actionMenu = useMemo(() => {
    return [
      {
        name: t('courseAttendanceListPage.markAsAttended'),
        isDisabled: !selectedSession || checkedRows.length === 0,
        action: async () => {
          try {
            await centralHttp.put(
              API_PATHS.COURSE_SESSION_MARK_ATTENDANCE.replace(
                ':id',
                selectedSession.id,
              ),
              {
                status: CourseSessionBookingStatus.ATTENDED,
                studentIds: checkedRows,
              },
            );
            updateAttendants(checkedRows, CourseSessionBookingStatus.ATTENDED);
          } catch (err) {
            console.error(err);
          }
        },
        activeIcon: (
          <FaCheck className="mr-2 h-5 w-5 text-green-300" aria-hidden="true" />
        ),
        inactiveIcon: (
          <FaCheck className="mr-2 h-5 w-5 text-green-200" aria-hidden="true" />
        ),
      },
      {
        name: t('courseAttendanceListPage.markAsAbsent'),
        isDisabled: !selectedSession || checkedRows.length === 0,
        action: async () => {
          try {
            await centralHttp.put(
              API_PATHS.COURSE_SESSION_MARK_ATTENDANCE.replace(
                ':id',
                selectedSession.id,
              ),
              {
                status: CourseSessionBookingStatus.NOT_ATTENDED,
                studentIds: checkedRows,
              },
            );
            updateAttendants(
              checkedRows,
              CourseSessionBookingStatus.NOT_ATTENDED,
            );
          } catch (err) {
            console.error(err);
          }
        },
        activeIcon: (
          <FaWindowClose
            className="mr-2 h-5 w-5 text-red-300"
            aria-hidden="true"
          />
        ),
        inactiveIcon: (
          <FaWindowClose
            className="mr-2 h-5 w-5 text-red-200"
            aria-hidden="true"
          />
        ),
      },
    ];
  }, [selectedSession, checkedRows]);

  return (
    <AccessControl
      policyNames={[BACKEND_ADMIN_CONTROL.ACCESS_CLASS_ATTENDANCE]}
    >
      <Layout token={token}>
        <Head>
          <title>
            {t('headerText')} | {t('courseAttendanceListPage.title')}
          </title>
        </Head>
        <div className="w-full p-6 lg:p-8">
          <div className="w-56">
            <DatePicker
              startDate={selectedDate}
              onChange={([date]) => setSelectedDate(date)}
              withTimezone={false}
              inputSectionProps={{
                label: t('courseAttendanceListPage.datePickerLabel'),
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="px-2 py-2">
              <h2 className="mb-2 py-2 text-left text-xl font-bold text-black">
                {t('courseAttendanceListPage.title')}{' '}
                {selectedSession &&
                  `- ${groupedSessions[selectedSession.courseId].title} / ${
                    groupedSessions[selectedSession.courseId].outlines[
                      selectedSession.courseOutlineId
                    ].title
                  } / ${format(
                    new Date(selectedSession.startDateTime),
                    'HH:mm',
                  )}-
                ${format(new Date(selectedSession.endDateTime), 'HH:mm')}`}
              </h2>
            </div>
            <DropdownButton
              wrapperClassNames={'mx-1'}
              buttonName="Actions"
              menuItems={actionMenu}
            />
          </div>
          <div className="flex items-start">
            <div className="flex w-1/4 px-2 py-2">
              <div className="flex-1 space-y-4 rounded bg-white p-6 shadow-lg">
                {Object.keys(groupedSessions).length ? (
                  Object.values(groupedSessions).map((course) => (
                    <CourseSessionGroup
                      key={course.id}
                      courseTitle={course.title}
                      outlines={Object.values(course.outlines)}
                      onSelectSession={setSelectedSession}
                      selectedSession={selectedSession}
                    />
                  ))
                ) : (
                  <span className="text-lg font-bold">
                    {t('courseAttendanceListPage.noCourseSessions')}
                  </span>
                )}
              </div>
            </div>
            <div className="flex w-3/4 px-2 py-2">
              <div className="flex-1 rounded bg-white p-4 shadow-lg">
                <div className="h-full" style={{ minHeight: '500px' }}>
                  <VirtualizedTable
                    list={attendants}
                    checkedRows={checkedRows}
                    onCheckboxChangeAction={setCheckedRows}
                    CustomTable={CourseAttendantsTable}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </AccessControl>
  );
};
