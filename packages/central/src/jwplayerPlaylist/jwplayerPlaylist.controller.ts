/**
 * These APIs are for CRUD jwplayer playlist
 * If you are looking for course playlist, please see CourseOutlineMediaPlayList
 */

import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BACKEND_ADMIN_CONTROL } from '@seaccentral/core/dist/access-control/constants';
import { Policy } from '@seaccentral/core/dist/access-control/policy.decorator';
import { PolicyGuard } from '@seaccentral/core/dist/access-control/policy.guard';
import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import { Request } from 'express';
import { User } from '@seaccentral/core/dist/user/User.entity';
import {
  BaseResponseDto,
  getPaginationResponseParams,
} from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { Playlist } from '@seaccentral/core/dist/playlist/playlist.entity';
import { Connection, DeleteResult, UpdateResult } from 'typeorm';
import { JwPlaylistService } from '../jwplayer/jwPlaylist.service';
import { CreatePlaylistDto } from './CreatePlaylist.dto';
import { MediaPlaylistService } from './mediaPlaylist.service';
import { JwplayerPlaylistService } from './jwplayerPlaylist.service';
import { EditPlaylistDto } from './EditPlaylist.dto';
import { ListPlaylistDto } from './ListPlaylist.dto';

@Controller('v1/jwplayerPlaylist')
@ApiTags('Playlist')
export class JwplayerPlaylistController {
  constructor(
    private readonly jwPlaylistService: JwPlaylistService,
    private readonly playlistService: JwplayerPlaylistService,
    private readonly mediaPlaylistService: MediaPlaylistService,
    private readonly connection: Connection,
  ) {}

  @Get()
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(JwplayerPlaylistController.prototype.list),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL)
  @UsePipes(new ValidationPipe({ transform: true }))
  async list(@Query() query: ListPlaylistDto) {
    const [result, count] = await this.playlistService.listPlaylist(query);
    const response = new BaseResponseDto<Playlist[]>();
    response.data = result;
    response.pagination = getPaginationResponseParams(query, count);

    return response;
  }

  @Post()
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(JwplayerPlaylistController.prototype.create),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL)
  @UseInterceptors(ClassSerializerInterceptor)
  async create(@Body() dto: CreatePlaylistDto, @Req() req: Request) {
    const author = req.user as User;
    const jwMediaIds = dto.medias.map(({ jwMediaId }) => jwMediaId);
    const mediaIds = dto.medias.map(({ id }) => id);

    const jwPlaylist = await this.jwPlaylistService.createManualPlaylist({
      metadata: {
        title: dto.title,
        description: dto.description,
        author: author.id,
        media_filter: {
          include: {
            values: jwMediaIds,
          },
        },
      },
    });
    return this.connection.transaction(async (manager) => {
      const playlist = await this.playlistService
        .withTransaction(manager)
        .createPlaylist(dto, jwPlaylist.id, author);
      await this.mediaPlaylistService
        .withTransaction(manager)
        .setPlaylistMedia(playlist, mediaIds);
      const response = new BaseResponseDto<Playlist>();
      response.data = playlist;

      return response;
    });
  }

  @Patch(':id')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(JwplayerPlaylistController.prototype.create),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL)
  @UseInterceptors(ClassSerializerInterceptor)
  async update(@Body() dto: EditPlaylistDto, @Param('id') id: string) {
    const playlist = await this.playlistService.findOnePlaylist({ id });
    if (!playlist) {
      throw new NotFoundException({ error: 'playlist not found' });
    }
    const jwMediaIds = dto.medias.map((media) => media.jwMediaId);
    const mediaIds = dto.medias.map((media) => media.id);

    await this.jwPlaylistService.updateManualPlaylist(playlist.jwPlaylistId, {
      metadata: {
        title: dto.title,
        description: dto.description,
        media_filter: {
          include: {
            values: jwMediaIds,
          },
        },
      },
    });

    return this.connection.transaction(async (manager) => {
      const result = await this.playlistService
        .withTransaction(manager)
        .updatePlaylist(id, dto);

      await this.mediaPlaylistService
        .withTransaction(manager)
        .setPlaylistMedia(playlist, mediaIds);
      const response = new BaseResponseDto<UpdateResult>();
      response.data = result;

      return response;
    });
  }

  @Delete(':id')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(JwplayerPlaylistController.prototype.delete),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL)
  @UseInterceptors(ClassSerializerInterceptor)
  async delete(@Param('id') id: string) {
    const playlist = await this.playlistService.findOnePlaylist({ id });
    if (!playlist) {
      throw new NotFoundException({ error: 'playlist not found' });
    }
    await this.jwPlaylistService.deleteManualPlaylist(playlist.jwPlaylistId);
    const result = await this.playlistService.deletePlaylist(playlist.id);
    const response = new BaseResponseDto<DeleteResult>();
    response.data = result;

    return result;
  }
}
