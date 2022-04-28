import { BulkUploadHistoryPage } from '../../admin/bulk-upload/BulkUploadHistoryPage';
import API_PATHS from '../../constants/apiPaths';
import { BACKEND_ADMIN_CONTROL } from '../../constants/policies';
import WEB_PATHS from '../../constants/webPaths';

export default function CourseDirectAccessBulkUploadHistoryPage() {
  return (
    <BulkUploadHistoryPage
      downloadApiPath={API_PATHS.GET_COURSE_DIRECT_ACCESS_UPLOAD_FILE}
      historyApiPath={API_PATHS.COURSE_DIRECT_ACCESS_BULK_UPLOAD_HISTORY}
      pageTitle="Course direct access upload History"
      policyNames={[BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT]}
      uploadPagePath={WEB_PATHS.COURSE_MANAGE_ACCESS_BULK_UPLOAD}
    />
  );
}
