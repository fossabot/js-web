import API_PATHS from '../../../constants/apiPaths';
import { BACKEND_ADMIN_CONTROL } from '../../../constants/policies';
import WEB_PATHS from '../../../constants/webPaths';
import { BulkUploadPage } from '../../bulk-upload/BulkUploadPage';
import useLearningTrackAssignedBulkUpload from './useLearningTrackAssignedBulkUpload';

export default function LearningTrackAssignedBulkUploadPage() {
  return (
    <BulkUploadPage
      pageTitle="Learning Track assigned bulk upload"
      policyNames={[BACKEND_ADMIN_CONTROL.ACCESS_LEARNING_TRACK_MANAGEMENT]}
      presignedApiPath={
        API_PATHS.GET_USER_ASSIGNED_LEARNING_TRACK_UPLOAD_PRESIGNED
      }
      uploadApiPath={API_PATHS.USER_ASSIGNED_LEARNING_TRACK_BULK_UPLOAD}
      uploadKey="userAssignedLearningTracks"
      historyPath={WEB_PATHS.LEARNING_TRACK_ASSIGNED_BULK_UPLOAD_HISTORY}
      {...useLearningTrackAssignedBulkUpload()}
    />
  );
}
