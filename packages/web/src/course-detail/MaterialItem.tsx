import { ERROR_CODES } from '../constants/errors';
import MaterialApi from '../http/material.api';
import useTranslation from '../i18n/useTranslation';
import { MaterialInternal, MaterialType } from '../models/baseMaterial';
import { CloudDownload, DocumentGray } from '../ui-kit/icons';

export default function MaterialItem({
  material,
  courseDetail,
  enrolledStatus,
  onValidateCourseOutline,
}) {
  const { t } = useTranslation();
  const isEnrolled = !!enrolledStatus?.success;

  async function handleDownload(material: MaterialInternal) {
    try {
      await MaterialApi.downloadMaterial(courseDetail.id, material);
    } catch (err) {
      console.error(err);
      if (err.response.data.code === ERROR_CODES.INVALID_SUBSCRIPTION.code) {
        onValidateCourseOutline({
          type: 'DONT_VALIDATE',
          plan: err.response.data.data.cheapestPlan,
          canUpgrade: err.response.data.data.canUpgrade,
        });
      }
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
