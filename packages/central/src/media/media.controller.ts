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
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  BACKEND_ADMIN_CONTROL,
  GOD_MODE,
} from '@seaccentral/core/dist/access-control/constants';
import { Policy } from '@seaccentral/core/dist/access-control/policy.decorator';
import {
  PolicyGuard,
  UserPolicies,
} from '@seaccentral/core/dist/access-control/policy.guard';
import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import { User } from '@seaccentral/core/dist/user/User.entity';
import {
  BaseResponseDto,
  getPaginationResponseParams,
} from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { Request } from 'express';
import { DeleteResult, UpdateResult } from 'typeorm';
import { Media, MediaStatus } from '@seaccentral/core/dist/media/media.entity';
import { ApiTags } from '@nestjs/swagger';
import { JWMediaService } from '../jwplayer/jwmedia.service';
import { CreateMediaDto } from './CreateMedia.dto';
import { MediaService } from './media.service';
import { UpdateMediaDto } from './UpdateMedia.dto';
import { ReuploadMediaDto } from './ReuploadMedia.dto';
import { MediaUploaderGuard } from './mediaUploader.guard';
import { ListMediaDto } from './ListMedia.dto';
import { JWWebhookDto } from '../jwplayer/JWWebhook.dto';
import { CreateMediaResponseDto } from './CreateMediaResponse.dto';
import { JwWebhookGuard } from '../jwplayer/jwWebhook.guard';
import { JWCdnService } from '../jwplayer/jwcdn.service';

@Controller('v1/media')
@ApiTags('Media')
export class MediaController {
  constructor(
    private readonly jwMediaService: JWMediaService,
    private readonly jwCdnService: JWCdnService,
    private readonly mediaService: MediaService,
  ) {}

  @Get('player-url')
  @UseGuards(JwtAuthGuard)
  async getPlayerUrl() {
    const url = this.jwCdnService.generatePlayerUrl();
    const response = new BaseResponseDto<string>();
    response.data = url;

    return response;
  }

  @Post()
  @UseGuards(JwtAuthGuard, PolicyGuard(MediaController.prototype.create))
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_VIDEO_MANAGEMENT)
  @UseInterceptors(ClassSerializerInterceptor)
  async create(@Body() dto: CreateMediaDto, @Req() req: Request) {
    const uploader = req.user as User;
    const jwMedia = await this.jwMediaService.createMedia({
      upload: {
        method: 'direct',
        mime_type: dto.mime,
      },
      metadata: {
        title: dto.title,
        description: dto.description,
        author: uploader.email,
      },
    });
    const ourMedia = await this.mediaService.createMedia({
      jwMedia,
      dto,
      uploader,
    });
    const response = new BaseResponseDto<CreateMediaResponseDto>();
    response.data = { media: ourMedia, jwMedia };
    return response;
  }

  @Get()
  @UseGuards(JwtAuthGuard, PolicyGuard(MediaController.prototype.list))
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_VIDEO_MANAGEMENT)
  @UsePipes(new ValidationPipe({ transform: true }))
  async list(@Query() query: ListMediaDto, @Req() req: Request & UserPolicies) {
    const uploader = req.userPolicies.has(GOD_MODE.GRANT_ALL_ACCESS)
      ? undefined
      : (req.user as User);
    const [result, count] = await this.mediaService.listMedia(query, uploader);
    const response = new BaseResponseDto<Media[]>();
    response.data = result;
    response.pagination = getPaginationResponseParams(query, count);

    return response;
  }

  @Get(':id')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(MediaController.prototype.getMedia),
    MediaUploaderGuard,
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_VIDEO_MANAGEMENT)
  @UseInterceptors(ClassSerializerInterceptor)
  async getMedia(@Param('id') id: string) {
    try {
      const media = await this.mediaService.getOneMedia({ id });
      await this.jwMediaService.getMedia(media.jwMediaId);
      const response = new BaseResponseDto<Media>();
      response.data = media;

      return response;
    } catch (error) {
      throw new NotFoundException();
    }
  }

  @Delete(':id')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(MediaController.prototype.delete),
    MediaUploaderGuard,
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_VIDEO_MANAGEMENT)
  @UseInterceptors(ClassSerializerInterceptor)
  async delete(@Param('id') id: string) {
    try {
      const { jwMediaId } = await this.mediaService.getOneMedia({ id });
      await this.jwMediaService.deleteMedia(jwMediaId);
      const deleteResult = await this.mediaService.deleteMedia({ id });

      const response = new BaseResponseDto<DeleteResult>();
      response.data = deleteResult;

      return response;
    } catch (error) {
      throw new NotFoundException();
    }
  }

  @Patch(':id')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(MediaController.prototype.updateMetadata),
    MediaUploaderGuard,
  )
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_VIDEO_MANAGEMENT)
  @UseInterceptors(ClassSerializerInterceptor)
  async updateMetadata(@Param('id') id: string, @Body() dto: UpdateMediaDto) {
    try {
      const { jwMediaId } = await this.mediaService.getOneMedia({ id });
      await this.jwMediaService.updateMedia(jwMediaId, {
        metadata: {
          title: dto.title,
          description: dto.description,
        },
      });
      const updateResult = await this.mediaService.updateMedia({ id }, dto);
      const response = new BaseResponseDto<UpdateResult>();
      response.data = updateResult;

      return response;
    } catch (error) {
      throw new NotFoundException();
    }
  }

  @Put(':id')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(MediaController.prototype.reuploadMedia),
    MediaUploaderGuard,
  )
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_VIDEO_MANAGEMENT)
  @UseInterceptors(ClassSerializerInterceptor)
  async reuploadMedia(@Param('id') id: string, @Body() dto: ReuploadMediaDto) {
    try {
      const ourMedia = await this.mediaService.getOneMedia({ id });
      const reuploadMediaResponse = await this.jwMediaService.reuploadMedia(
        ourMedia.jwMediaId,
        {
          upload: {
            method: 'direct',
            mime_type: dto.mime,
          },
        },
      );
      await this.mediaService.updateMedia(
        { id },
        { ...dto, status: MediaStatus.Created, duration: 0 },
      );
      const response = new BaseResponseDto<CreateMediaResponseDto>();
      response.data = { media: ourMedia, jwMedia: reuploadMediaResponse };

      return response;
    } catch (error) {
      throw new NotFoundException();
    }
  }

  @Get(':id/signed-url')
  @UseGuards(JwtAuthGuard)
  async getSignedUrl(@Param('id') id: string) {
    try {
      const { jwMediaId } = await this.mediaService.getOneMedia({ id });
      const url = this.jwCdnService.generateMediaUrl(jwMediaId);
      const response = new BaseResponseDto<string>();
      response.data = url;

      return response;
    } catch (error) {
      throw new NotFoundException();
    }
  }

  @Post('hook/media-available')
  @UseGuards(JwWebhookGuard)
  async updateDuration(@Body() body: JWWebhookDto) {
    const media = await this.jwMediaService.getMedia(body.media_id);
    const updateResult = await this.mediaService.updateMedia(
      { jwMediaId: media.id },
      { status: MediaStatus.Available, duration: media.duration },
    );
    const response = new BaseResponseDto<UpdateResult>();
    response.data = updateResult;

    return response;
  }
}
