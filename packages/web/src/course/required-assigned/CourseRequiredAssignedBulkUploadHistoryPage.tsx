import { BulkUploadHistoryPage } from '../../admin/bulk-upload/BulkUploadHistoryPage';
import API_PATHS from '../../constants/apiPaths';
import { BACKEND_ADMIN_CONTROL } from '../../constants/policies';
import WEB_PATHS from '../../constants/webPaths';

export default function CourseRequiredAssignedBulkUploadHistoryPage() {
  return (
    <BulkUploadHistoryPage
      downloadApiPath={API_PATHS.GET_USER_ASSIGNED_COURSES_UPLOAD_FILE}
      historyApiPath={API_PATHS.USER_ASSIGNED_COURSES_BULK_UPLOAD_HISTORY}
      pageTitle="Course required/assigned upload History"
      policyNames={[BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT]}
      uploadPagePath={WEB_PATHS.COURSE_REQUIRED_ASSIGNED_BULK_UPLOAD}
    />
  );
}
