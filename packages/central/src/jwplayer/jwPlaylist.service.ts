import { Inject, Injectable } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import { JWAPI } from './jwapi';

export interface CreateManualPlaylistPayload {
  metadata: {
    title: string;
    description?: string;
    author?: string;
    link?: string;
    custom_params?: Record<string, string>;
    media_filter?: {
      include: {
        match?: 'any';
        values: string[];
      };
    };
  };
}

export interface GetManualPlaylistResponse {
  id: string;
  created: string;
  last_modified: string;
  type: string;
  relationships: Record<string, any>;
  metadata: {
    title: string;
    description: string | null;
    author: string | null;
    link: string | null;
    custom_params: Record<string, string> | null;
    media_filter: {
      include: {
        match?: 'any';
        values: string[];
      };
    };
  };
}

@Injectable()
export class JwPlaylistService {
  constructor(@Inject(JWAPI) private readonly jwapi: AxiosInstance) {}

  // https://developer.jwplayer.com/jwplayer/reference/post_v2-sites-site-id-playlists-manual-playlist
  async createManualPlaylist(payload: CreateManualPlaylistPayload) {
    const { data } = await this.jwapi.post<GetManualPlaylistResponse>(
      'playlists/manual_playlist',
      payload,
    );

    return data;
  }

  // https://developer.jwplayer.com/jwplayer/reference/get_v2-sites-site-id-playlists-playlist-id-manual-playlist
  async getManualPlaylist(playlistId: string) {
    const { data } = await this.jwapi.get<GetManualPlaylistResponse>(
      `playlists/${playlistId}/manual_playlist`,
    );

    return data;
  }

  // https://developer.jwplayer.com/jwplayer/reference/patch_v2-sites-site-id-playlists-playlist-id-manual-playlist
  async updateManualPlaylist(
    playlistId: string,
    payload: CreateManualPlaylistPayload,
  ) {
    const { data } = await this.jwapi.patch<GetManualPlaylistResponse>(
      `playlists/${playlistId}/manual_playlist`,
      payload,
    );

    return data;
  }

  // https://developer.jwplayer.com/jwplayer/reference/delete_v2-sites-site-id-playlists-playlist-id-manual-playlist
  async deleteManualPlaylist(playlistId: string) {
    await this.jwapi.delete<void>(`playlists/${playlistId}/manual_playlist`);
  }
}
