import { Injectable } from '@nestjs/common';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { Media } from '@seaccentral/core/dist/media/media.entity';
import { ILike, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateMediaDto } from './CreateMedia.dto';
import { CreateMediaResponse } from '../jwplayer/IJWMediaService';
import { ListMediaDto } from './ListMedia.dto';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
  ) {}

  async createMedia(params: {
    jwMedia: CreateMediaResponse;
    dto: CreateMediaDto;
    uploader: User;
  }) {
    const { jwMedia, dto, uploader } = params;
    const media = await this.mediaRepository.create({
      jwMediaId: jwMedia.id,
      duration: jwMedia.duration,
      uploader,
      title: dto.title,
      description: dto.description,
      filename: dto.filename,
      bytes: dto.bytes,
      mime: dto.mime,
    });

    await this.mediaRepository.save(media);

    return media;
  }

  async getOneMedia(conditions: Partial<Media>) {
    const result = await this.mediaRepository.findOneOrFail(conditions);

    return result;
  }

  async listMedia(dto: ListMediaDto, uploader?: User) {
    const searchField = dto.searchField
      ? { [dto.searchField]: ILike(`%${dto.search}%`) }
      : {};
    const uploaderField = uploader ? { uploader } : {};
    const orderByField = dto.orderBy ? { [dto.orderBy]: dto.order } : {};
    const result = await this.mediaRepository.findAndCount({
      where: { ...searchField, ...uploaderField },
      take: dto.take,
      skip: dto.skip,
      order: { ...orderByField },
    });

    return result;
  }

  async deleteMedia(conditions: Partial<Media>) {
    const result = await this.mediaRepository.delete(conditions);

    return result;
  }

  async updateMedia(conditions: Partial<Media>, media: Partial<Media>) {
    const result = await this.mediaRepository.update(conditions, media);

    return result;
  }
}
