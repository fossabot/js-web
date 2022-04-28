import { format as dateFnsFormat } from 'date-fns';

import { centralHttp } from '../../http';
import { ICourse } from '../../models/course';
import API_PATHS from '../../constants/apiPaths';
import { EMAIL_PATTERN, TIMEZONE_PATTERN } from '../../constants/regex';
import {
  appendWorkSheetToWorkBook,
  autofitColumns,
  convertExcelToJson,
  convertJSONToSheet,
  createWorkBook,
  downloadWorkBook,
  formatDate,
  parseDate,
} from '../../utils/file-helper';
import {
  DEFAULT_TIMEZONE_GMT,
  DATE_TIME_FORMAT_A,
} from '../../constants/datetime';

interface ICourseDirectAccessHeaders {
  courseId: string;
  userEmail: string;
  expiryDate: string;
  timezone: string;
}

export default function useCourseDirectAccessBulkUpload() {
  const courseDirectAccessHeaders: ICourseDirectAccessHeaders = {
    courseId: 'Course Id',
    userEmail: 'User Email',
    expiryDate: 'Expiry Date Time (mm/dd/yyyy HH:MM)',
    timezone: 'Timezone (EG: GMT+0700)',
  };

  const downloadTemplate = (courses: ICourse<string>[]) => {
    const fileName = 'course_direct_access_template.xlsx';

    const courseDirectAccessWs = convertJSONToSheet([], {
      header: Object.values(courseDirectAccessHeaders),
    });
    autofitColumns([courseDirectAccessHeaders], courseDirectAccessWs);

    const courseWsData = courses
      .filter((c) => !!c.id)
      .map((c) => ({
        createdAt: dateFnsFormat(new Date(c.createdAt), 'dd MMMM yyyy H:mm'),
        courseId: c.id,
        title: c.title,
        category: c.category?.name,
      }));
    const courseWs = convertJSONToSheet(courseWsData, {
      header: ['createdAt', 'courseId', 'title', 'category'],
    });
    autofitColumns(courseWsData, courseWs);

    const wb = createWorkBook();
    appendWorkSheetToWorkBook(wb, courseDirectAccessWs, 'course_direct_access');
    appendWorkSheetToWorkBook(wb, courseWs, 'courses (DO NOT EDIT)');

    downloadWorkBook(wb, fileName);
  };

  const processFile = async (e: any, files: FileList) => {
    const results: any[] = await convertExcelToJson(files[0]);
    const allEmails = results
      .filter((r) => !!r[courseDirectAccessHeaders.userEmail]?.trim().length)
      .map((r) =>
        r[courseDirectAccessHeaders.userEmail].split(',').map((i) => i.trim()),
      )
      .flat();

    validateEmails(allEmails);
    validateRows(results, courseDirectAccessHeaders);

    const { data } = await centralHttp.post(API_PATHS.ADMIN_USERS_BY_EMAILS, {
      emails: allEmails,
    });
    const allUsers = data.data;

    return results.map((r, index) => {
      const users = allUsers.filter((ue) =>
        r[courseDirectAccessHeaders.userEmail]
          ?.split(',')
          .map((e) => e.trim())
          .includes(ue.email),
      );

      if (users.length < 1) {
        throw `Invalid user email at row: ${index + 2}`;
      }

      return {
        users,
        userId: users.map((u) => u.id)?.[0],
        courseId: r[courseDirectAccessHeaders.courseId],
        expiryDateTime: formatExcelDate(
          r[courseDirectAccessHeaders.expiryDate],
          r[courseDirectAccessHeaders.timezone],
        ),
      };
    });
  };

  return { downloadTemplate, processFile };
}

function validateEmails(emails: string[]) {
  for (const email of emails) {
    if (!email || !EMAIL_PATTERN.test(email)) {
      throw `${
        !email ? 'User email should not be empty' : 'Invalid users email: '
      }${email}`;
    }
  }
}

function validateRows(results: any[], headers: ICourseDirectAccessHeaders) {
  for (let i = 0; i < results.length; i += 1) {
    if (
      results[i][headers.timezone] !== undefined &&
      !TIMEZONE_PATTERN.test(results[i][headers.timezone])
    ) {
      throw `Invalid timezone at row: ${i + 2}`;
    }

    if (!results[i][headers.courseId]) {
      throw `Please provide course id at row: ${i + 2}`;
    }

    if (!results[i][headers.userEmail]) {
      throw `Please provide user email at row: ${i + 2}`;
    }

    try {
      formatExcelDate(
        results[i][headers.expiryDate],
        results[i][headers.timezone],
      );
    } catch (error) {
      throw `Invalid expiry date at row: ${i + 2}`;
    }

    try {
      formatExcelDate(
        results[i][headers.expiryDate],
        results[i][headers.timezone],
      );
    } catch (error) {
      throw `Invalid expiry date at row: ${i + 2}`;
    }
  }
}

function formatExcelDate(excelDate, timezone = DEFAULT_TIMEZONE_GMT) {
  return new Date(
    `${formatDate(parseDate(excelDate), DATE_TIME_FORMAT_A)} ${timezone}`,
  ).toISOString();
}
