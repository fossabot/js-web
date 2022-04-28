import { format as dateFnsFormat } from 'date-fns';
import API_PATHS from '../constants/apiPaths';
import { EMAIL_PATTERN, TIMEZONE_PATTERN } from '../constants/regex';
import { centralHttp } from '../http';
import { BaseResponseDto } from '../models/BaseResponse.dto';
import { CourseLanguage, ICourseOutline } from '../models/course';
import { Language } from '../models/language';
import { User } from '../models/user';
import { enumToArray } from '../utils/array';
import { formatDateChunks } from '../utils/date';
import {
  appendWorkSheetToWorkBook,
  autofitColumns,
  convertExcelToJson,
  convertJSONToSheet,
  createWorkBook,
  downloadWorkBook,
} from '../utils/file-helper';

interface ICourseSessionHeaders {
  courseOutlineId: string;
  seats: string;
  webinarTool: string;
  location: string;
  participantUrl: string;
  startDate: string;
  startMonth: string;
  startYear: string;
  startTime: string;
  endDate: string;
  endMonth: string;
  endYear: string;
  endTime: string;
  timezone: string;
  instructors: string;
  language: string;
  isPrivate: string;
}

export default function useCourseSessionBulkUpload() {
  const courseSessionHeaders: ICourseSessionHeaders = {
    courseOutlineId: 'Course Outline Id',
    seats: 'Seats',
    language: 'Language',
    webinarTool: 'Webinar Tool',
    location: 'Location',
    participantUrl: 'Participant URL',
    startDate: 'Start Date (DD)',
    startMonth: 'Start Month (MM)',
    startYear: 'Start Year (YYYY)',
    startTime: 'Start Time (HH:MM)',
    endDate: 'End Date (DD)',
    endMonth: 'End Month (MM)',
    endYear: 'End Year (YYYY)',
    endTime: 'End Time (HH:MM)',
    timezone: 'Timezone (EG: GMT+0700)',
    instructors: 'Instructor Emails (Comma separated)',
    isPrivate: 'Private Class (yes or no)',
  };

  const fetchInstructors = async () => {
    const { data } = await centralHttp.get<BaseResponseDto<User[]>>(
      API_PATHS.ADMIN_USERS,
      { params: { role: 'INSTRUCTOR' } },
    );
    return data.data;
  };

  const downloadTemplate = async (
    courseOutlines: ICourseOutline<Language>[],
  ) => {
    const fileName = 'course_session_template.xlsx';

    const courseSessionWs = convertJSONToSheet([], {
      header: Object.values(courseSessionHeaders),
    });
    autofitColumns([courseSessionHeaders], courseSessionWs);

    const courseOutlineWsData = courseOutlines
      .filter((co) => !!co.id)
      .map((co) => ({
        createdAt: dateFnsFormat(new Date(co.createdAt), 'dd MMMM yyyy H:mm'),
        courseOutlineId: co.id,
        title: co.title,
        category: co.category?.name,
        courseTitle: co.course?.title,
      }));
    const courseOutlineWs = convertJSONToSheet(courseOutlineWsData, {
      header: [
        'createdAt',
        'courseOutlineId',
        'title',
        'category',
        'courseTitle',
      ],
    });
    autofitColumns(courseOutlineWsData, courseOutlineWs);

    const instructors = await fetchInstructors();
    const instructorWsData = instructors.map((instructor) => ({
      id: instructor.id,
      email: instructor.email,
      firstName: instructor.firstName,
      lastName: instructor.lastName,
    }));
    const instructorWs = convertJSONToSheet(instructorWsData, {
      header: ['id', 'email', 'firstName', 'lastName'],
    });
    autofitColumns(instructorWsData, instructorWs);

    const wb = createWorkBook();
    appendWorkSheetToWorkBook(wb, courseSessionWs, 'course_sessions');
    appendWorkSheetToWorkBook(
      wb,
      courseOutlineWs,
      'course_outlines (DO NOT EDIT)',
    );
    appendWorkSheetToWorkBook(wb, instructorWs, 'instructors (DO NOT EDIT)');

    downloadWorkBook(wb, fileName);
  };

  const processFile = async (e: any, files: FileList) => {
    const results = await convertExcelToJson<ICourseSessionHeaders>(files[0], {
      raw: false,
    });
    const allInstructorEmails = results
      .filter((r) => !!r[courseSessionHeaders.instructors]?.trim().length)
      .map((r) =>
        r[courseSessionHeaders.instructors].split(',').map((i) => i.trim()),
      )
      .flat();

    validateEmails(allInstructorEmails);
    validateRows(results, courseSessionHeaders);

    const { data } = await centralHttp.post(API_PATHS.ADMIN_USERS_BY_EMAILS, {
      emails: allInstructorEmails,
    });
    const allInstructors = data.data;

    return results.map((r, index) => {
      const instructors = allInstructors.filter((inst) =>
        r[courseSessionHeaders.instructors]
          ?.split(',')
          .map((i) => i.trim())
          .includes(inst.email),
      );

      if (instructors.length < 1) {
        throw `Invalid instructor email(s) at row: ${index + 2}`;
      }

      return {
        instructors,
        seats: r[courseSessionHeaders.seats],
        instructorsIds: instructors.map((i) => i.id),
        webinarTool: r[courseSessionHeaders.webinarTool],
        location: r[courseSessionHeaders.location],
        participantUrl: r[courseSessionHeaders.participantUrl],
        courseOutlineId: r[courseSessionHeaders.courseOutlineId],
        language: r[courseSessionHeaders.language],
        startDateTime: formatDateChunks(
          r[courseSessionHeaders.startDate],
          r[courseSessionHeaders.startMonth],
          r[courseSessionHeaders.startYear],
          r[courseSessionHeaders.startTime],
          r[courseSessionHeaders.timezone],
        ),
        endDateTime: formatDateChunks(
          r[courseSessionHeaders.endDate],
          r[courseSessionHeaders.endMonth],
          r[courseSessionHeaders.endYear],
          r[courseSessionHeaders.endTime],
          r[courseSessionHeaders.timezone],
        ),
        isPrivate:
          String(r[courseSessionHeaders.isPrivate]).toLowerCase() === 'yes',
      };
    });
  };

  return { downloadTemplate, processFile };
}

function validateEmails(emails: string[]) {
  for (const email of emails) {
    if (!email || !EMAIL_PATTERN.test(email)) {
      throw `${
        !email
          ? 'Instructor email should not be empty'
          : 'Invalid instructor email: '
      }${email}`;
    }
  }
}

function validateRows(results: any[], headers: ICourseSessionHeaders) {
  for (let i = 0; i < results.length; i += 1) {
    if (enumToArray(CourseLanguage).indexOf(results[i][headers.language]) < 0) {
      throw `Invalid language at row: ${i + 2}. Should be one of ${enumToArray(
        CourseLanguage,
      ).join(', ')}`;
    }

    if (
      results[i][headers.timezone] !== undefined &&
      !TIMEZONE_PATTERN.test(results[i][headers.timezone])
    ) {
      throw `Invalid timezone at row: ${i + 2}`;
    }

    if (!results[i][headers.courseOutlineId]) {
      throw `Please provide course outline id at row: ${i + 2}`;
    }

    if (!results[i][headers.instructors]) {
      throw `Please provide atleast 1 instructor at row: ${i + 2}`;
    }

    try {
      formatDateChunks(
        results[i][headers.startDate],
        results[i][headers.startMonth],
        results[i][headers.startYear],
        results[i][headers.startTime],
        results[i][headers.timezone],
      );
    } catch (error) {
      throw `Invalid start date at row: ${i + 2}`;
    }

    try {
      formatDateChunks(
        results[i][headers.endDate],
        results[i][headers.endMonth],
        results[i][headers.endYear],
        results[i][headers.endTime],
        results[i][headers.timezone],
      );
    } catch (error) {
      throw `Invalid end date at row: ${i + 2}`;
    }
  }
}
