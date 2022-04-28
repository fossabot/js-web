import { Inject } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import {
  CreateMediaPayload,
  CreateMediaResponse,
  GetMediaResponse,
  ListMediaQuery,
  ListMediaResponse,
  ReuploadMediaPayload,
  ReuploadMediaResponse,
  UpdateMediaPayload,
  UpdateMediaResponse,
} from './IJWMediaService';
import { JWAPI } from './jwapi';

export class JWMediaService {
  constructor(@Inject(JWAPI) private readonly jwapi: AxiosInstance) {}

  // https://developer.jwplayer.com/jwplayer/reference/get_v2-sites-site-id-media
  async listMedia(query: ListMediaQuery) {
    const { data } = await this.jwapi.get<ListMediaResponse>('media', {
      params: query,
    });

    return data;
  }

  // https://developer.jwplayer.com/jwplayer/reference/post_v2-sites-site-id-media
  async createMedia(payload: CreateMediaPayload) {
    const { data } = await this.jwapi.post<CreateMediaResponse>(
      'media',
      payload,
    );

    return data;
  }

  // https://developer.jwplayer.com/jwplayer/reference/get_v2-sites-site-id-media-media-id-
  async getMedia(mediaId: string) {
    const { data } = await this.jwapi.get<GetMediaResponse>(`media/${mediaId}`);

    return data;
  }

  // https://developer.jwplayer.com/jwplayer/reference/patch_v2-sites-site-id-media-media-id-
  async updateMedia(mediaId: string, payload: UpdateMediaPayload) {
    const { data } = await this.jwapi.patch<UpdateMediaResponse>(
      `media/${mediaId}`,
      payload,
    );

    return data;
  }

  // https://developer.jwplayer.com/jwplayer/reference/delete_v2-sites-site-id-media-media-id-
  async deleteMedia(mediaId: string) {
    await this.jwapi.delete(`media/${mediaId}`);
  }

  // https://developer.jwplayer.com/jwplayer/reference/put_v2-sites-site-id-media-media-id-reupload
  async reuploadMedia(mediaId: string, payload: ReuploadMediaPayload) {
    const { data } = await this.jwapi.put<ReuploadMediaResponse>(
      `media/${mediaId}/reupload`,
      payload,
    );

    return data;
  }
}
