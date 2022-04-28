import { format as dateFnsFormat } from 'date-fns';
import API_PATHS from '../../constants/apiPaths';
import {
  DATE_TIME_FORMAT_A,
  DEFAULT_TIMEZONE_GMT,
} from '../../constants/datetime';
import { EMAIL_PATTERN, TIMEZONE_PATTERN } from '../../constants/regex';
import { centralHttp } from '../../http';
import { ILearningTrack } from '../../models/learningTrack';
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

interface ILearningTrackDirectAccessHeaders {
  learningTrackId: string;
  userEmail: string;
  expiryDate: string;
  timezone: string;
}

export default function useLearningTrackDirectAccessBulkUpload() {
  const learningTrackDirectAccessHeaders: ILearningTrackDirectAccessHeaders = {
    learningTrackId: 'Learning Track Id',
    userEmail: 'User Email',
    expiryDate: 'Expiry Date Time (mm/dd/yyyy HH:MM)',
    timezone: 'Timezone (EG: GMT+0700)',
  };

  const downloadTemplate = (learningTracks: ILearningTrack<string>[]) => {
    const fileName = 'learning_track_direct_access_template.xlsx';

    const learningTrackDirectAccessWs = convertJSONToSheet([], {
      header: Object.values(learningTrackDirectAccessHeaders),
    });
    autofitColumns(
      [learningTrackDirectAccessHeaders],
      learningTrackDirectAccessWs,
    );

    const learningTrackWsData = learningTracks
      .filter((c) => !!c.id)
      .map((c) => ({
        createdAt: dateFnsFormat(new Date(c.createdAt), 'dd MMMM yyyy H:mm'),
        learningTrackId: c.id,
        title: c.title,
        category: c.category?.name,
      }));
    const learningTrackWs = convertJSONToSheet(learningTrackWsData, {
      header: ['createdAt', 'learningTrackId', 'title', 'category'],
    });
    autofitColumns(learningTrackWsData, learningTrackWs);

    const wb = createWorkBook();
    appendWorkSheetToWorkBook(
      wb,
      learningTrackDirectAccessWs,
      'learning_track_direct_access',
    );
    appendWorkSheetToWorkBook(
      wb,
      learningTrackWs,
      'learning tracks (DO NOT EDIT)',
    );

    downloadWorkBook(wb, fileName);
  };

  const processFile = async (e: any, files: FileList) => {
    const results: any[] = await convertExcelToJson(files[0]);
    const allEmails = results
      .filter(
        (r) => !!r[learningTrackDirectAccessHeaders.userEmail]?.trim().length,
      )
      .map((r) =>
        r[learningTrackDirectAccessHeaders.userEmail]
          .split(',')
          .map((i) => i.trim()),
      )
      .flat();

    validateEmails(allEmails);
    validateRows(results, learningTrackDirectAccessHeaders);

    const { data } = await centralHttp.post(API_PATHS.ADMIN_USERS_BY_EMAILS, {
      emails: allEmails,
    });
    const allUsers = data.data;

    return results.map((r, index) => {
      const users = allUsers.filter((ue) =>
        r[learningTrackDirectAccessHeaders.userEmail]
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
        learningTrackId: r[learningTrackDirectAccessHeaders.learningTrackId],
        expiryDateTime: formatExcelDate(
          r[learningTrackDirectAccessHeaders.expiryDate],
          r[learningTrackDirectAccessHeaders.timezone],
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

function validateRows(
  results: any[],
  headers: ILearningTrackDirectAccessHeaders,
) {
  for (let i = 0; i < results.length; i += 1) {
    if (
      results[i][headers.timezone] !== undefined &&
      !TIMEZONE_PATTERN.test(results[i][headers.timezone])
    ) {
      throw `Invalid timezone at row: ${i + 2}`;
    }

    if (!results[i][headers.learningTrackId]) {
      throw `Please provide learning track id at row: ${i + 2}`;
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
