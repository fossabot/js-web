import { centralHttp as http } from './index';
import API_PATHS from '../constants/apiPaths';
import { MaterialInternal } from '../models/baseMaterial';
import mime from 'mime';
import axios from 'axios';
import fileDownload from 'js-file-download';
import path from 'path';
import sanitizeFilename from 'sanitize-filename';
import { BaseResponseDto } from '../models/BaseResponse.dto';

const MaterialApi = {
  getMaterial: async (queryOptions = {}): Promise<any> => {
    const response = await http.get(API_PATHS.MATERIALS, {
      params: queryOptions,
    });
    return response.data;
  },

  downloadMaterial: async (courseId: string, material: MaterialInternal) => {
    const url = API_PATHS.COURSE_MATERIAL_DOWNLOAD.replace(
      ':id',
      courseId,
    ).replace(':materialId', material.id);
    const { data } = await http.get<BaseResponseDto<string>>(url);

    const extension = mime.getExtension((material as MaterialInternal).mime);
    const res = await axios.get(data.data, { responseType: 'blob' });

    fileDownload(
      res.data,
      `${path.basename(
        sanitizeFilename(material.displayName),
        `.${extension}`,
      )}.${extension}`,
    );
  },
};

export default MaterialApi;
