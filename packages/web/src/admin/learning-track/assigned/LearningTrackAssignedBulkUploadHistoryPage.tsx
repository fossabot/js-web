import API_PATHS from '../../../constants/apiPaths';
import { BACKEND_ADMIN_CONTROL } from '../../../constants/policies';
import WEB_PATHS from '../../../constants/webPaths';
import { BulkUploadHistoryPage } from '../../bulk-upload/BulkUploadHistoryPage';

export default function LearningTrackAssignedBulkUploadHistoryPage() {
  return (
    <BulkUploadHistoryPage
      pageTitle="Learning Track assigned upload History"
      downloadApiPath={API_PATHS.GET_USER_ASSIGNED_LEARNING_TRACK_UPLOAD_FILE}
      historyApiPath={
        API_PATHS.USER_ASSIGNED_LEARNING_TRACK_BULK_UPLOAD_HISTORY
      }
      policyNames={[BACKEND_ADMIN_CONTROL.ACCESS_LEARNING_TRACK_MANAGEMENT]}
      uploadPagePath={WEB_PATHS.LEARNING_TRACK_ASSIGNED_BULK_UPLOAD}
    />
  );
}
