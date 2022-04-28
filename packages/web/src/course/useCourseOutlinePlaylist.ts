import React, { useState } from 'react';
import { debounce } from 'lodash';
import { centralHttp } from '../http';
import { Media } from '../models/media';
import { BaseResponseDto } from '../models/BaseResponse.dto';
import API_PATHS from '../constants/apiPaths';

export function useCourseOutlinePlaylist() {
  const [medias, setMedias] = useState<Media[]>([]);

  async function searchMedia(values: string) {
    const params = {
      search: values,
      searchField: 'title',
      perPage: 10,
      order: 'DESC',
      orderBy: 'updatedAt',
    };
    const { data } = await centralHttp.get<BaseResponseDto<Media[]>>(
      API_PATHS.MEDIA,
      { params },
    );

    return data.data;
  }

  async function handleOnChangeSearchQuery(
    evt: React.ChangeEvent<{ value: string }>,
  ) {
    const result = await searchMedia(evt.target.value);
    setMedias(result);
  }

  return {
    handleOnChangeSearchQuery: debounce(handleOnChangeSearchQuery, 500, {
      maxWait: 3000,
    }),
    medias,
  };
}
