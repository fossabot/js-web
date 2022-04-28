import API_PATHS from '../constants/apiPaths';
import { centralHttp } from '../http';
import { CreateMediaResponse } from './CreateMediaResponse.dto';
import { VideoCreateFormValue } from './videoForm.schema';
import axios from 'axios';
import { BaseResponseDto } from '../models/BaseResponse.dto';
import { useEffect, useState } from 'react';
import { identity, pickBy } from 'lodash';
import { useRouter } from 'next/router';
import WEB_PATHS from '../constants/webPaths';

export function useVideoForm() {
  const [topbar, setTopbar] = useState<any>();
  const router = useRouter();
  useEffect(() => {
    importTopbar();
  }, []);

  async function importTopbar() {
    const lib = await import('topbar');
    setTopbar(lib);
  }

  async function uploadMedia(uploadLink: string, file: File) {
    topbar.config({ autorun: false });
    topbar.show();
    await axios.put(uploadLink, file, {
      headers: { 'Content-Type': file.type },
      onUploadProgress: (data) => {
        topbar.progress(data.loaded / data.total);
      },
    });
    topbar.hide();
  }

  async function createVideo(values: VideoCreateFormValue) {
    const { title, description, file } = pickBy(values, identity);
    const res = await centralHttp.post<BaseResponseDto<CreateMediaResponse>>(
      API_PATHS.MEDIA,
      {
        title,
        description,
        mime: file.type,
        filename: file.name,
        bytes: file.size,
      },
    );
    const { media, jwMedia } = res.data.data;

    await uploadMedia(jwMedia.upload_link, file);
    await router.push(`${WEB_PATHS.VIDEO_MANAGEMENT}/${media.id}`);
  }

  async function editVideo(mediaId: string, values: VideoCreateFormValue) {
    const { title, description, file } = pickBy(values, identity);
    const mediaEndpoint = API_PATHS.MEDIA_ID.replace(':id', mediaId);
    await centralHttp.patch<BaseResponseDto<any>>(mediaEndpoint, {
      title,
      description,
    });
    if (file) {
      const res = await centralHttp.put<BaseResponseDto<CreateMediaResponse>>(
        mediaEndpoint,
        { mime: file.type, filename: file.name, bytes: file.size },
      );
      const { jwMedia } = res.data.data;
      await uploadMedia(jwMedia.upload_link, file);
    }
  }

  return { createVideo, editVideo };
}
