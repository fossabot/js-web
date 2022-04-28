import { useState } from 'react';
import API_PATHS from '../constants/apiPaths';
import useList, { FetchOptions } from '../hooks/useList';
import { centralHttp } from '../http';
import { BaseResponseDto } from '../models/BaseResponse.dto';
import { Media } from '../models/media';
import { useModal } from '../ui-kit/Modal';

export function useVideoListPage() {
  const { count, data, totalPages, fetchData } = useList<Media>(listMedias);
  const modalDelete = useModal();
  const [media2Delete, setMedia2Delete] = useState<Media>(null);

  async function listMedias(options: FetchOptions) {
    const response = await centralHttp.get<BaseResponseDto<Media[]>>(
      API_PATHS.MEDIA,
      { params: options },
    );

    return response;
  }

  async function handleDeleteMedia() {
    const url = API_PATHS.MEDIA_ID.replace(':id', media2Delete.id);
    await centralHttp.delete<BaseResponseDto<any>>(url);
    setMedia2Delete(null);
    await fetchData();
  }

  function handleDeleteModal(media: Media) {
    modalDelete.toggle();
    setMedia2Delete(media);
  }

  return {
    count,
    medias: data,
    totalPages,
    fetchData,
    modalDelete,
    handleDeleteModal,
    handleDeleteMedia,
    media2Delete,
  };
}
