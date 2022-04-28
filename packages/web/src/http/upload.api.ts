import axios from 'axios';

import config from '../config';
import { centralHttp as http } from './index';
import API_PATHS from '../constants/apiPaths';

const UploadApi = {
  uploadUserFileToS3: async (file: File): Promise<any> => {
    const response = await http.post(API_PATHS.GET_UPLOAD_USER_PRESIGNED, {
      fileName: file.name,
      fileType: file.type,
    });
    const { url, key } = response.data.data;
    await axios.put(url, file, {
      headers: {
        'Content-Type': file.type,
      },
    });
    return key;
  },
  getSCORMPresign: async (keys: string[]) => {
    const response = await http.post(API_PATHS.UPLOAD_SCORM_PRESIGNED, {
      keys,
    });
    return response.data;
  },
  uploadCourseImageToS3: async (file: File): Promise<any> => {
    const response = await http.post(API_PATHS.UPLOAD_COURSE_IMAGE_PRESIGNED, {
      fileName: file.name,
      fileType: file.type,
    });
    const { url, key } = response.data.data;
    await axios.put(url, file, {
      headers: {
        'Content-Type': file.type,
      },
    });
    return key;
  },
  uploadLearningTrackImageToS3: async (file: File): Promise<any> => {
    const response = await http.post(
      API_PATHS.UPLOAD_LEARNING_TRACK_IMAGE_PRESIGNED,
      {
        fileName: file.name,
        fileType: file.type,
      },
    );
    const { url, key } = response.data.data;
    await axios.put(url, file, {
      headers: {
        'Content-Type': file.type,
      },
    });
    return key;
  },
  uploadFileToS3: async (url: string, file: File): Promise<any> => {
    return axios.put(url, file, {
      headers: {
        'Content-Type': file.type || '',
      },
    });
  },
  getDownloadUrl: (key: string): string => {
    return `${config.CENTRAL_API_BASE_URL}/${API_PATHS.GET_USER_UPLOAD_FILE}?key=${key}`;
  },
};

export default UploadApi;
