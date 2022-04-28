import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Playlist } from '@seaccentral/core/dist/playlist/playlist.entity';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { TransactionFor } from '@seaccentral/core/dist/utils/withTransaction';
import { ILike, Repository } from 'typeorm';
import { CreatePlaylistDto } from './CreatePlaylist.dto';
import { EditPlaylistDto } from './EditPlaylist.dto';
import { ListPlaylistDto } from './ListPlaylist.dto';

@Injectable()
export class JwplayerPlaylistService extends TransactionFor<JwplayerPlaylistService> {
  constructor(
    @InjectRepository(Playlist)
    private readonly playlistRepository: Repository<Playlist>,
    moduleRef: ModuleRef,
  ) {
    super(moduleRef);
  }

  async findOnePlaylist(conditions: Partial<Playlist>) {
    const playlist = await this.playlistRepository.findOne(conditions);

    return playlist;
  }

  async createPlaylist(
    dto: CreatePlaylistDto,
    jwPlaylistId: string,
    author: User,
  ) {
    const playlist = await this.playlistRepository.save({
      jwPlaylistId,
      title: dto.title,
      description: dto.description,
      author,
    });

    return playlist;
  }

  async updatePlaylist(playlistId: string, dto: EditPlaylistDto) {
    return this.playlistRepository.update(
      { id: playlistId },
      { title: dto.title, description: dto.description },
    );
  }

  async listPlaylist(dto: ListPlaylistDto) {
    const searchField = dto.searchField
      ? { [dto.searchField]: ILike(`%${dto.search}%`) }
      : {};
    const orderByField = dto.orderBy ? { [dto.orderBy]: dto.order } : {};
    const result = await this.playlistRepository.findAndCount({
      where: { ...searchField },
      take: dto.take,
      skip: dto.skip,
      order: { ...orderByField },
    });

    return result;
  }

  async deletePlaylist(playlistId: string) {
    return this.playlistRepository.delete({ id: playlistId });
  }
}
