import Link from 'next/link';
import { useMemo } from 'react';
import { ERROR_CODES } from '../../constants/errors';
import { ValidateCourseOutlineParams } from '../../course-detail/CourseDetailPage';
import MaterialApi from '../../http/material.api';
import { MaterialType } from '../../models/baseMaterial';
import { IMaterial } from '../../models/material';
import { DocumentGray } from '../../ui-kit/icons';

interface IMaterialItemProps {
  courseId: string;
  material: IMaterial;
  isEnrolled: boolean;
  onValidateCourseOutline: (
    params: ValidateCourseOutlineParams,
  ) => Promise<boolean>;
}

function MaterialItem({
  courseId,
  material,
  isEnrolled,
  onValidateCourseOutline,
}: IMaterialItemProps) {
  async function handleDownload(material) {
    try {
      await MaterialApi.downloadMaterial(courseId, material);
    } catch (error) {
      if (error.response.data.code === ERROR_CODES.INVALID_SUBSCRIPTION.code) {
        onValidateCourseOutline({
          type: 'DONT_VALIDATE',
          plan: error.response.data.data.cheapestPlan,
          canUpgrade: error.response.data.data.canUpgrade,
        });
      }

      console.error('error', error);
    }
  }

  const materialItem = useMemo(() => {
    if (material.type === MaterialType.MATERIAL_INTERNAL && isEnrolled) {
      return (
        <div
          className="mt-4 flex cursor-pointer items-center rounded-2xl bg-gray-100 px-5 py-4 text-body font-semibold"
          onClick={() => handleDownload(material)}
        >
          <DocumentGray className="mr-1" />
          <span className="flex-1 line-clamp-1">{material.displayName}</span>
        </div>
      );
    } else if (material.type === MaterialType.MATERIAL_EXTERNAL && isEnrolled) {
      return (
        <Link href={material.url}>
          <a
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex cursor-pointer items-center rounded-2xl bg-gray-100 px-5 py-4 text-body font-semibold"
          >
            <DocumentGray className="mr-1" />
            <span className="flex-1 line-clamp-1">{material.displayName}</span>
          </a>
        </Link>
      );
    } else {
      return (
        <div className="mt-4 flex items-center rounded-2xl bg-gray-100 px-5 py-4 text-body font-semibold">
          <DocumentGray className="mr-1" />
          <span className="flex-1 line-clamp-1">{material.displayName}</span>
        </div>
      );
    }
  }, [material]);

  return <>{materialItem}</>;
}

export default MaterialItem;
