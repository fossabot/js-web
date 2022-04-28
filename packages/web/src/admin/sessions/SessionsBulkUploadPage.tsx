import { useCallback } from 'react';
import API_PATHS from '../../constants/apiPaths';
import { BACKEND_ADMIN_CONTROL } from '../../constants/policies';
import WEB_PATHS from '../../constants/webPaths';
import useCourseSessionBulkUpload from '../../hooks/useCourseSessionBulkUpload';
import { centralHttp } from '../../http';
import { CourseCategoryKey } from '../../models/course';
import { BulkUploadPage } from '../bulk-upload/BulkUploadPage';

export default function SessionsBulkUploadPage() {
  const { downloadTemplate, processFile } = useCourseSessionBulkUpload();

  const handleDownloadTemplate = useCallback(async () => {
    const { data } = await centralHttp.get(API_PATHS.COURSE_OUTLINES, {
      params: {
        perPage: 10000,
        search: CourseCategoryKey.LEARNING_EVENT,
        searchField: 'courseCategoryKey',
        orderBy: 'createdAt',
        order: 'DESC',
      },
    });
    await downloadTemplate(data.data);
  }, [downloadTemplate]);

  return (
    <BulkUploadPage
      downloadTemplate={handleDownloadTemplate}
      processFile={processFile}
      historyPath={WEB_PATHS.SESSION_MANAGEMENT_BULK_UPLOAD_HISTORY}
      pageTitle="Course session bulk upload"
      policyNames={[BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT]}
      presignedApiPath={API_PATHS.GET_COURSE_SESSION_UPLOAD_PRESIGNED}
      uploadApiPath={API_PATHS.COURSE_SESSION_BULK_UPLOAD}
      uploadKey="courseSessions"
    />
  );
}
