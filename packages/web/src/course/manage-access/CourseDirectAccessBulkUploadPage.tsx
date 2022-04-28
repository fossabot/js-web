import { useCallback } from 'react';
import { BulkUploadPage } from '../../admin/bulk-upload/BulkUploadPage';
import API_PATHS from '../../constants/apiPaths';
import { BACKEND_ADMIN_CONTROL } from '../../constants/policies';
import WEB_PATHS from '../../constants/webPaths';
import { centralHttp } from '../../http';
import useCourseDirectAccessBulkUpload from './useCourseDirectAccessBulkUpload';

export default function CourseDirectAccessBulkUploadPage() {
  const { downloadTemplate, processFile } = useCourseDirectAccessBulkUpload();

  const handleDownloadTemplate = useCallback(async () => {
    const { data } = await centralHttp.get(API_PATHS.COURSES, {
      params: {
        perPage: 10000,
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
      historyPath={WEB_PATHS.COURSE_MANAGE_ACCESS_BULK_UPLOAD_HISTORY}
      pageTitle="Course direct access bulk upload"
      policyNames={[BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT]}
      presignedApiPath={API_PATHS.GET_COURSE_DIRECT_ACCESS_UPLOAD_PRESIGNED}
      uploadApiPath={API_PATHS.COURSE_DIRECT_ACCESS_BULK_UPLOAD}
      uploadKey="courseDirectAccess"
    />
  );
}
