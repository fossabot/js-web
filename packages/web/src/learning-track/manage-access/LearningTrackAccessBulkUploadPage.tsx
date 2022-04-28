import { useCallback } from 'react';
import { BulkUploadPage } from '../../admin/bulk-upload/BulkUploadPage';
import API_PATHS from '../../constants/apiPaths';
import { BACKEND_ADMIN_CONTROL } from '../../constants/policies';
import WEB_PATHS from '../../constants/webPaths';
import { centralHttp } from '../../http';
import useLearningTrackDirectAccessBulkUpload from './useLearningTrackDirectAccessBulkUpload';

export default function LearningTrackAccessBulkUploadPage() {
  const { downloadTemplate, processFile } =
    useLearningTrackDirectAccessBulkUpload();

  const handleDownloadTempalte = useCallback(async () => {
    const { data } = await centralHttp.get(API_PATHS.LEARNING_TRACKS, {
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
      downloadTemplate={handleDownloadTempalte}
      processFile={processFile}
      historyPath={WEB_PATHS.LEARNING_TRACK_MANAGE_ACCESS_BULK_UPLOAD_HISTORY}
      pageTitle="Learning track direct access bulk upload"
      policyNames={[BACKEND_ADMIN_CONTROL.ACCESS_LEARNING_TRACK_MANAGEMENT]}
      presignedApiPath={
        API_PATHS.GET_LEARNING_TRACK_DIRECT_ACCESS_UPLOAD_PRESIGNED
      }
      uploadApiPath={API_PATHS.LEARNING_TRACK_DIRECT_ACCESS_BULK_UPLOAD}
      uploadKey="learningTrackDirectAccess"
    ></BulkUploadPage>
  );
}
