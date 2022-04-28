import { useState } from 'react';
import API_PATHS from '../constants/apiPaths';
import useList, { FetchOptions } from '../hooks/useList';
import { centralHttp } from '../http';
import { BaseMaterial, MaterialInternal } from '../models/baseMaterial';
import { BaseResponseDto } from '../models/BaseResponse.dto';
import { useModal } from '../ui-kit/Modal';
import { GetMaterialDto } from './GetMaterial.dto';
import fileDownload from 'js-file-download';
import axios from 'axios';
import mime from 'mime';
import path from 'path';
import sanitizeFilename from 'sanitize-filename';

export function useMaterialListPage() {
  const { count, data, totalPages, fetchData } =
    useList<GetMaterialDto>(getAllMaterials);
  const modalDelete = useModal();
  const [material2Delete, setMaterial2Delete] = useState<BaseMaterial>(null);

  async function getAllMaterials(options: FetchOptions) {
    const params = {
      ...options,
    };
    const response = await centralHttp.get<BaseResponseDto<GetMaterialDto[]>>(
      API_PATHS.MATERIALS,
      { params },
    );

    return response;
  }

  async function handleDownload(material: MaterialInternal) {
    const url = API_PATHS.MATERIALS_DOWNLOAD_URL.replace(':id', material.id);
    const { data } = await centralHttp.get<BaseResponseDto<string>>(url);
    const extension = mime.getExtension(material.mime);
    const res = await axios.get(data.data, { responseType: 'blob' });
    fileDownload(
      res.data,
      `${path.basename(
        sanitizeFilename(material.displayName),
        `.${extension}`,
      )}.${mime.getExtension(material.mime)}`,
    );
  }

  async function toggleDeleteModal(material: BaseMaterial) {
    modalDelete.toggle();
    setMaterial2Delete(material);
  }

  async function handleDeleteMaterial() {
    const material = material2Delete;
    const url = API_PATHS.MATERIALS_ID.replace(':id', material.id);
    await centralHttp.delete<BaseResponseDto<any>>(url);
    window.location.reload();
  }

  return {
    count,
    data,
    totalPages,
    fetchData,
    handleDownload,
    modalDelete: {
      isOpen: modalDelete.isOpen,
      toggle: toggleDeleteModal,
    },
    handleDeleteMaterial,
  };
}
