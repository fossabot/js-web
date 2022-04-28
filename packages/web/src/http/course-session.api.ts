import { stringifyUrl } from 'query-string';
import { centralHttp } from '.';
import API_PATHS from '../constants/apiPaths';
import { BaseResponseDto } from '../models/BaseResponse.dto';
import {
  CourseLanguage,
  CourseSessionBookingStatus,
  ICourseSession,
  ICourseSessionCalendar,
} from '../models/course';
import { CourseSessionOverview } from '../models/course-session';
import SessionAttendant from '../models/session-attendance';

interface ISearchCourseSessionParams {
  courseOutlineId: string;
  instructorIds?: string[];
  language?: CourseLanguage;
  startTime?: Date;
  endTime?: Date;
}

interface IFetchCourseSessionCalendar {
  courseOutlineId?: string;
  startTime?: Date;
  endTime?: Date;
  onlyEnrolled?: boolean;
  instructorId?: string;
}

const CourseSessionApi = {
  getCourseSessionOverview: async (sessionId: string) => {
    const url = API_PATHS.COURSE_SESSION_BY_ID.replace(':id', sessionId);
    const { data } = await centralHttp.get<
      BaseResponseDto<CourseSessionOverview>
    >(url);
    return data?.data;
  },

  getAllCourseAttendances: async (
    sessionId: string,
    page = 1,
    perPage = 100,
  ) => {
    const url = stringifyUrl({
      url: API_PATHS.COURSE_SESSION_ATTENDANTS.replace(':id', sessionId),
      query: {
        page,
        perPage,
      },
    });
    const { data } = await centralHttp.get<BaseResponseDto<SessionAttendant[]>>(
      url,
    );
    return data?.data;
  },

  markCourseAttendances: async (
    sessionId: string,
    studentIds: string[],
    status: CourseSessionBookingStatus,
  ) => {
    await centralHttp.put(
      API_PATHS.COURSE_SESSION_MARK_ATTENDANCE.replace(':id', sessionId),
      {
        status,
        studentIds,
      },
    );
  },

  async searchCourseSessions({
    courseOutlineId,
    instructorIds,
    language,
    startTime,
    endTime,
  }: ISearchCourseSessionParams) {
    const { data } = await centralHttp.get<BaseResponseDto<ICourseSession[]>>(
      API_PATHS.COURSE_SESSIONS,
      {
        params: {
          courseOutlineId,
          instructorIds,
          language,
          startTime: startTime?.toJSON() || undefined,
          endTime: endTime?.toJSON() || undefined,
        },
      },
    );

    return data?.data;
  },

  async fetchCalendar({
    courseOutlineId,
    startTime,
    endTime,
    onlyEnrolled,
    instructorId,
  }: IFetchCourseSessionCalendar) {
    const { data } = await centralHttp.get<
      BaseResponseDto<ICourseSessionCalendar[]>
    >(API_PATHS.COURSE_SESSIONS_CALENDAR, {
      params: {
        courseOutlineId,
        instructorId,
        onlyEnrolled,
        startTime: startTime?.toJSON() || undefined,
        endTime: endTime?.toJSON() || undefined,
      },
    });

    return data?.data;
  },

  async addRegistrants(courseSessionId: string, studentIds: string[]) {
    const url = API_PATHS.COURSE_SESSION_STUDENTS.replace(
      ':id',
      courseSessionId,
    );
    await centralHttp.post(url, {
      studentIds,
    });
  },

  async getParticipantReports(courseSessionId: string) {
    const url = API_PATHS.COURSE_SESSION_PARTICIPANT_REPORTS.replace(
      ':id',
      courseSessionId,
    );

    return centralHttp.get(url, { responseType: 'blob' });
  },
};

export default CourseSessionApi;
