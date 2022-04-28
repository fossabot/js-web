import API_PATHS from '../../constants/apiPaths';
import { BACKEND_ADMIN_CONTROL } from '../../constants/policies';
import WEB_PATHS from '../../constants/webPaths';
import { BulkUploadHistoryPage } from '../bulk-upload/BulkUploadHistoryPage';

export default function SessionsBulkUploadHistoryPage() {
  return (
    <BulkUploadHistoryPage
      downloadApiPath={API_PATHS.GET_COURSE_SESSION_UPLOAD_FILE}
      historyApiPath={API_PATHS.COURSE_SESSION_BULK_UPLOAD_HISTORY}
      pageTitle="Course session upload History"
      policyNames={[BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT]}
      uploadPagePath={WEB_PATHS.SESSION_MANAGEMENT_BULK_UPLOAD}
    />
  );
}
