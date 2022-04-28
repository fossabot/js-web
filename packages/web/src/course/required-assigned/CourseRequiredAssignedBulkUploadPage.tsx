import { BulkUploadPage } from '../../admin/bulk-upload/BulkUploadPage';
import API_PATHS from '../../constants/apiPaths';
import { BACKEND_ADMIN_CONTROL } from '../../constants/policies';
import WEB_PATHS from '../../constants/webPaths';
import useCourseRequiredAssignedBulkUpload from './useCourseRequiredAssignedBulkUpload';

export default function CourseRequiredAssignedBulkUploadPage() {
  return (
    <BulkUploadPage
      {...useCourseRequiredAssignedBulkUpload()}
      pageTitle="Course required/assigned bulk upload"
      policyNames={[BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT]}
      historyPath={WEB_PATHS.COURSE_REQUIRED_ASSIGNED_BULK_UPLOAD_HISTORY}
      presignedApiPath={API_PATHS.GET_USER_ASSIGNED_COURSES_UPLOAD_PRESIGNED}
      uploadApiPath={API_PATHS.USER_ASSIGNED_COURSES_BULK_UPLOAD}
      uploadKey="userAssignedCourses"
    />
  );
}
