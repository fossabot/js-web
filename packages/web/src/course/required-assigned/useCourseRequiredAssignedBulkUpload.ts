import { format as dateFnsFormat } from 'date-fns';
import API_PATHS from '../../constants/apiPaths';
import { TIMEZONE_PATTERN } from '../../constants/regex';
import { centralHttp } from '../../http';
import { BaseResponseDto } from '../../models/BaseResponse.dto';
import { ICourse } from '../../models/course';
import { User } from '../../models/user';
import { UserAssignedCourseType } from '../../models/userAssignedCourse';
import { formatDateChunks } from '../../utils/date';
import {
  appendWorkSheetToWorkBook,
  autofitColumns,
  convertExcelToJson,
  convertJSONToSheet,
  createWorkBook,
  downloadWorkBook,
} from '../../utils/file-helper';

interface ICourseRequiredAssignedTemplateHeader {
  courseId: string;
  userId: string;
  expiryDate: string;
  expiryMonth: string;
  expiryYear: string;
  expiryTime: string;
  timezone: string;
  type: string;
}

export default function useCourseRequiredAssignedBulkUpload() {
  const courseRequiredAssignedTemplateHeader: ICourseRequiredAssignedTemplateHeader =
    {
      courseId: 'Course Id',
      userId: 'User Id',
      expiryDate: 'Start Date (DD)',
      expiryMonth: 'Start Month (MM)',
      expiryYear: 'Start Year (YYYY)',
      expiryTime: 'Start Time (HH:MM)',
      timezone: 'Timezone (EG: GMT+0700)',
      type: 'Assigned / Required',
    };

  const fetchRecentUsers = async () => {
    const { data } = await centralHttp.get<BaseResponseDto<User[]>>(
      API_PATHS.ADMIN_USERS,
      { params: { perPage: 1000, orderBy: 'createdAt', order: 'DESC' } },
    );
    return data.data;
  };

  async function fetchRecentCourses() {
    const { data } = await centralHttp.get<BaseResponseDto<ICourse[]>>(
      API_PATHS.COURSES,
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
    const fileName = 'course_required_assigned_template.xlsx';

    const courseRequiredAssignedWs = convertJSONToSheet([], {
      header: Object.values(courseRequiredAssignedTemplateHeader),
    });
    autofitColumns(
      [courseRequiredAssignedTemplateHeader],
      courseRequiredAssignedWs,
    );

    const courses = await fetchRecentCourses();

    const courseWsData = courses.map((c) => ({
      createdAt: dateFnsFormat(new Date(c.createdAt), 'dd MMMM yyyy H:mm'),
      courseId: c.id,
      title: c.title,
    }));
    const courseWs = convertJSONToSheet(courseWsData, {
      header: ['createdAt', 'courseId', 'title'],
    });
    autofitColumns(courseWsData, courseWs);

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
    appendWorkSheetToWorkBook(
      wb,
      courseRequiredAssignedWs,
      'course_required_assigned',
    );
    appendWorkSheetToWorkBook(wb, courseWs, 'recent_courses (DO NOT EDIT)');
    appendWorkSheetToWorkBook(wb, userWs, 'recent_users (DO NOT EDIT)');

    downloadWorkBook(wb, fileName);
  };

  const processFile = async (e: any, files: FileList) => {
    const results =
      await convertExcelToJson<ICourseRequiredAssignedTemplateHeader>(
        files[0],
        {
          raw: false,
        },
      );

    validateRows(results, courseRequiredAssignedTemplateHeader);

    return results.map((r) => {
      return {
        courseId: r[courseRequiredAssignedTemplateHeader.courseId],
        userId: r[courseRequiredAssignedTemplateHeader.userId],
        dueDateTime: formatDateChunks(
          r[courseRequiredAssignedTemplateHeader.expiryDate],
          r[courseRequiredAssignedTemplateHeader.expiryMonth],
          r[courseRequiredAssignedTemplateHeader.expiryYear],
          r[courseRequiredAssignedTemplateHeader.expiryTime],
          r[courseRequiredAssignedTemplateHeader.timezone],
        ),
        assignmentType:
          r[courseRequiredAssignedTemplateHeader.type].toLowerCase() ===
          'assigned'
            ? UserAssignedCourseType.Optional
            : UserAssignedCourseType.Required,
      };
    });
  };

  return { downloadTemplate, processFile };
}

function validateRows(
  results: any[],
  headers: ICourseRequiredAssignedTemplateHeader,
) {
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

    if (!results[i][headers.userId]) {
      throw `Please provide user id at row: ${i + 2}`;
    }

    const type = results[i][headers.type]?.toLowerCase();

    if (type !== 'required' && type !== 'assigned') {
      throw `Type must be either 'assigned' or 'required' at row: ${i + 2}`;
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
