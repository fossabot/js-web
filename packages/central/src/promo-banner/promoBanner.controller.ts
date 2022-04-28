import {
  Body,
  CacheInterceptor,
  CacheKey,
  CacheTTL,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Connection } from 'typeorm';

import { cacheKeys } from '@seaccentral/core/dist/redis/cacheKeys';
import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import { BaseResponseDto } from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { Policy } from '@seaccentral/core/dist/access-control/policy.decorator';
import { PolicyGuard } from '@seaccentral/core/dist/access-control/policy.guard';
import { RedisCacheService } from '@seaccentral/core/dist/redis/redisCache.service';
import { BACKEND_ADMIN_CONTROL } from '@seaccentral/core/dist/access-control/constants';

import * as s3UrlConditionBuilder from '@seaccentral/core/dist/utils/s3UrlConditionBuilder';
import { UploadService } from '../upload/upload.service';
import { PromoBannerService } from './promoBanner.service';
import { S3_PROMO_BANNER_FOLDER } from '../utils/constants';
import { PromoBannerCollectionDto } from './dto/PromoBannerBody.dto';
import { PromoBannerResponseDto } from './dto/PromoBannerResponse.dto';

@Controller('v1/promo-banners')
export class PromoBannerController {
  constructor(
    private readonly promoBannerService: PromoBannerService,
    private readonly connection: Connection,
    private readonly uploadService: UploadService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(CacheInterceptor, ClassSerializerInterceptor)
  @CacheTTL(86400)
  @CacheKey(cacheKeys.USER_DASHBOARD.PROMO_BANNER)
  async listAll() {
    const promoBanners = await this.promoBannerService.listAll();
    const response = new BaseResponseDto<PromoBannerResponseDto[]>();
    response.data = promoBanners.map(
      (promoBanner) => new PromoBannerResponseDto(promoBanner),
    );

    return response;
  }

  @Post()
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(PromoBannerController.prototype.setBanners),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_PROMO_BANNER)
  @UseInterceptors(ClassSerializerInterceptor)
  async setBanners(@Body() dto: PromoBannerCollectionDto) {
    const promoBanners = await this.connection.transaction(async (manager) => {
      return this.promoBannerService
        .withTransaction(manager, { excluded: [RedisCacheService] })
        .setBanners(dto);
    });
    const response = new BaseResponseDto<PromoBannerResponseDto[]>();
    response.data = promoBanners.map(
      (promoBanner) => new PromoBannerResponseDto(promoBanner),
    );

    return response;
  }

  @Post('banners')
  @UseGuards(JwtAuthGuard)
  async uploadBanner() {
    const s3PresignedUrl = await this.uploadService.getPresignedPostUrl({
      fileName: 'banner',
      folder: S3_PROMO_BANNER_FOLDER,
      expires: 300,
      conditions: s3UrlConditionBuilder.build(
        s3UrlConditionBuilder.startsWith(S3_PROMO_BANNER_FOLDER),
      ),
    });
    const response = new BaseResponseDto<AWS.S3.PresignedPost>();
    response.data = s3PresignedUrl;

    return response;
  }
}
