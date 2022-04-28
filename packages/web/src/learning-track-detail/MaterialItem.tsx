import mime from 'mime';
import path from 'path';
import axios from 'axios';
import fileDownload from 'js-file-download';
import sanitizeFilename from 'sanitize-filename';

import { centralHttp } from '../http';
import API_PATHS from '../constants/apiPaths';
import useTranslation from '../i18n/useTranslation';
import { CloudDownload, DocumentGray } from '../ui-kit/icons';
import { BaseResponseDto } from '../models/BaseResponse.dto';
import { MaterialInternal, MaterialType } from '../models/baseMaterial';

export default function MaterialItem({
  material,
  learningTrackDetail,
  enrolledStatus,
}) {
  const { t } = useTranslation();
  const isEnrolled = !!enrolledStatus?.success;

  async function handleDownload(material: MaterialInternal) {
    try {
      const url = API_PATHS.LEARNING_TRACK_MATERIAL_DOWNLOAD.replace(
        ':id',
        learningTrackDetail.id,
      ).replace(':materialId', material.id);
      const { data } = await centralHttp.get<BaseResponseDto<string>>(url);

      const extension = mime.getExtension((material as MaterialInternal).mime);
      const res = await axios.get(data.data, { responseType: 'blob' });

      fileDownload(
        res.data,
        `${path.basename(
          sanitizeFilename(material.displayName),
          `.${extension}`,
        )}.${extension}`,
      );
    } catch (error) {
      console.error('error', error);
    }
  }

  return (
    <div className="mb-4 flex w-full items-center justify-between rounded-2xl border border-gray-200 p-4">
      <div className="flex items-center">
        <DocumentGray className="mr-2 inline h-6 w-6" />
        <span className="mr-2 text-body font-semibold line-clamp-1">
          {material.displayName}
        </span>
      </div>
      {material.type === MaterialType.MATERIAL_INTERNAL && isEnrolled && (
        <a
          className="flex items-center rounded-lg border border-gray-300 bg-gray-100 py-1 px-3"
          onClick={() => handleDownload(material)}
        >
          <CloudDownload className="mr-1 inline h-4 w-4 text-black" />
          <span className="text-caption font-semibold">{t('download')}</span>
        </a>
      )}
      {material.type === MaterialType.MATERIAL_EXTERNAL && isEnrolled && (
        <a
          target="_blank"
          rel="noreferrer noopener"
          href={material.url}
          download={material.displayName}
          className="flex items-center rounded-lg border border-gray-300 bg-gray-100 py-1 px-3"
        >
          <CloudDownload className="mr-1 inline h-4 w-4 text-black" />
          <span className="text-caption font-semibold">{t('download')}</span>
        </a>
      )}
    </div>
  );
}
