import { User } from '@sentry/nextjs';
import { format as dateFnsFormat } from 'date-fns';
import API_PATHS from '../../../constants/apiPaths';
import { TIMEZONE_PATTERN } from '../../../constants/regex';
import { centralHttp } from '../../../http';
import { BaseResponseDto } from '../../../models/BaseResponse.dto';
import { ILearningTrack } from '../../../models/learningTrack';
import { formatDateChunks } from '../../../utils/date';
import {
  appendWorkSheetToWorkBook,
  autofitColumns,
  convertExcelToJson,
  convertJSONToSheet,
  createWorkBook,
  downloadWorkBook,
} from '../../../utils/file-helper';

interface ILearningTrackAssignedTemplateHeader {
  learningTrackId: string;
  userId: string;
  expiryDate: string;
  expiryMonth: string;
  expiryYear: string;
  expiryTime: string;
  timezone: string;
}

export default function useLearningTrackAssignedBulkUpload() {
  const learningTrackAssignedTemplateHeader: ILearningTrackAssignedTemplateHeader =
    {
      learningTrackId: 'Learning Track Id',
      userId: 'User Id',
      expiryDate: 'Start Date (DD)',
      expiryMonth: 'Start Month (MM)',
      expiryYear: 'Start Year (YYYY)',
      expiryTime: 'Start Time (HH:MM)',
      timezone: 'Timezone (EG: GMT+0700)',
    };

  const fetchRecentUsers = async () => {
    const { data } = await centralHttp.get<BaseResponseDto<User[]>>(
      API_PATHS.ADMIN_USERS,
      { params: { perPage: 1000, orderBy: 'createdAt', order: 'DESC' } },
    );
    return data.data;
  };

  async function fetchRecentLearningTracks() {
    const { data } = await centralHttp.get<BaseResponseDto<ILearningTrack[]>>(
      API_PATHS.LEARNING_TRACKS,
      {
        params: {
          perPage: 1000,
          orderBy: 'createdAt',
          order: 'DESC',
        },
      },
    );

    return data.data;
  }
  const downloadTemplate = async () => {
    const fileName = 'learning_track_assigned_template.xlsx';

    const learningTrackAssignedWs = convertJSONToSheet([], {
      header: Object.values(learningTrackAssignedTemplateHeader),
    });
    autofitColumns(
      [learningTrackAssignedTemplateHeader],
      learningTrackAssignedWs,
    );

    const learningTracks = await fetchRecentLearningTracks();

    const learningTrackWsData = learningTracks.map((lt) => ({
      createdAt: dateFnsFormat(new Date(lt.createdAt), 'dd MMMM yyyy H:mm'),
      learningTrackId: lt.id,
      title: lt.title,
    }));
    const learningTrackWs = convertJSONToSheet(learningTrackWsData, {
      header: ['createdAt', 'learningTrackId', 'title'],
    });
    autofitColumns(learningTrackWsData, learningTrackWs);

    const users = await fetchRecentUsers();
    const userWsData = users.map((user) => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    }));
    const userWs = convertJSONToSheet(userWsData, {
      header: ['id', 'email', 'firstName', 'lastName'],
    });
    autofitColumns(userWsData, userWs);

    const wb = createWorkBook();
    appendWorkSheetToWorkBook(wb, learningTrackAssignedWs, 'lt_assigned');
    appendWorkSheetToWorkBook(wb, learningTrackWs, 'recent_lt (DO NOT EDIT)');
    appendWorkSheetToWorkBook(wb, userWs, 'recent_users (DO NOT EDIT)');

    downloadWorkBook(wb, fileName);
  };

  const processFile = async (e: any, files: FileList) => {
    const results =
      await convertExcelToJson<ILearningTrackAssignedTemplateHeader>(files[0], {
        raw: false,
      });

    validateRows(results, learningTrackAssignedTemplateHeader);

    return results.map((r) => {
      return {
        learningTrackId: r[learningTrackAssignedTemplateHeader.learningTrackId],
        userId: r[learningTrackAssignedTemplateHeader.userId],
        dueDateTime: formatDateChunks(
          r[learningTrackAssignedTemplateHeader.expiryDate],
          r[learningTrackAssignedTemplateHeader.expiryMonth],
          r[learningTrackAssignedTemplateHeader.expiryYear],
          r[learningTrackAssignedTemplateHeader.expiryTime],
          r[learningTrackAssignedTemplateHeader.timezone],
        ),
      };
    });
  };

  return { downloadTemplate, processFile };
}

function validateRows(
  results: any[],
  headers: ILearningTrackAssignedTemplateHeader,
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

    if (!results[i][headers.userId]) {
      throw `Please provide user id at row: ${i + 2}`;
    }

    try {
      formatDateChunks(
        results[i][headers.expiryDate],
        results[i][headers.expiryMonth],
        results[i][headers.expiryYear],
        results[i][headers.expiryTime],
        results[i][headers.timezone],
      );
    } catch (error) {
      throw `Invalid expiry date at row: ${i + 2}`;
    }
  }
}
