import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { MediaPlaylist } from '@seaccentral/core/dist/playlist/mediaPlaylist.entity';
import { Playlist } from '@seaccentral/core/dist/playlist/playlist.entity';
import { TransactionFor } from '@seaccentral/core/dist/utils/withTransaction';
import { Repository } from 'typeorm';

@Injectable()
export class MediaPlaylistService extends TransactionFor<MediaPlaylistService> {
  constructor(
    @InjectRepository(MediaPlaylist)
    private readonly mediaPlaylistRepository: Repository<MediaPlaylist>,
    moduleRef: ModuleRef,
  ) {
    super(moduleRef);
  }

  getPlaylistMedia(playlistId: string) {
    return this.mediaPlaylistRepository.find({ playlist: { id: playlistId } });
  }

  async setPlaylistMedia(playlist: Playlist, mediaIds: string[]) {
    const playlistMedia = mediaIds.map((id, index) => ({
      playlist,
      media: { id },
      sequence: index,
    }));

    await this.deletePlaylistMedia(playlist);
    const result = await this.mediaPlaylistRepository.save(playlistMedia);

    return result;
  }

  async deletePlaylistMedia(playlist: Playlist) {
    const result = await this.mediaPlaylistRepository.delete({ playlist });

    return result;
  }
}
