import { BulkUploadHistoryPage } from '../../admin/bulk-upload/BulkUploadHistoryPage';
import API_PATHS from '../../constants/apiPaths';
import { BACKEND_ADMIN_CONTROL } from '../../constants/policies';
import WEB_PATHS from '../../constants/webPaths';

export default function LearningTrackAccessBulkUploadHistoryPage() {
  return (
    <BulkUploadHistoryPage
      downloadApiPath={API_PATHS.GET_LEARNING_TRACK_DIRECT_ACCESS_UPLOAD_FILE}
      historyApiPath={
        API_PATHS.LEARNING_TRACK_DIRECT_ACCESS_BULK_UPLOAD_HISTORY
      }
      pageTitle="Learning Track direct access upload History"
      policyNames={[BACKEND_ADMIN_CONTROL.ACCESS_LEARNING_TRACK_MANAGEMENT]}
      uploadPagePath={WEB_PATHS.LEARNING_TRACK_MANAGE_ACCESS_BULK_UPLOAD}
    />
  );
}
