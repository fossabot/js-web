import { ModuleRef } from '@nestjs/core';
import { In, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, Logger } from '@nestjs/common';

import { cacheKeys } from '@seaccentral/core/dist/redis/cacheKeys';
import { deleteObjectFromS3 } from '@seaccentral/core/dist/utils/s3';
import { Language } from '@seaccentral/core/dist/language/Language.entity';
import { TransactionFor } from '@seaccentral/core/dist/utils/withTransaction';
import { RedisCacheService } from '@seaccentral/core/dist/redis/redisCache.service';
import { PromoBanner } from '@seaccentral/core/dist/promo-banner/PromoBanner.entity';

import { PromoBannerCollectionDto } from './dto/PromoBannerBody.dto';

@Injectable()
export class PromoBannerService extends TransactionFor<PromoBannerService> {
  private logger = new Logger(PromoBannerService.name);

  constructor(
    @InjectRepository(PromoBanner)
    private readonly promoBannerRepository: Repository<PromoBanner>,
    @InjectRepository(Language)
    private readonly languageRepository: Repository<Language>,
    private readonly redisCacheService: RedisCacheService,
    moduleRef: ModuleRef,
  ) {
    super(moduleRef);
  }

  listAll() {
    return this.promoBannerRepository.find({ order: { sequence: 'ASC' } });
  }

  async setBanners(dto: PromoBannerCollectionDto) {
    const { banners } = dto;
    this.redisCacheService
      .del(cacheKeys.USER_DASHBOARD.PROMO_BANNER)
      .catch((err) => this.logger.error('Error caching PROMO_BANNER', err));

    const [promoBanners, banners2Delete] = await Promise.all([
      this.promoBannerRepository.find(),
      this.promoBannerRepository.find({
        where: {
          assetKey: Not(In(banners.map((banner) => banner.assetKey))),
        },
      }),
    ]);

    const langEntries = promoBanners.reduce((acc: string[], cur) => {
      if (cur.header) acc.push(cur.header.id);
      if (cur.subtitle) acc.push(cur.subtitle.id);
      if (cur.cta) acc.push(cur.cta.id);
      return acc;
    }, []);

    if (langEntries.length > 0) {
      await this.languageRepository.delete(langEntries);
    }
    await this.promoBannerRepository.createQueryBuilder().delete().execute();

    const entities = banners.map((banner, index) =>
      this.promoBannerRepository.create({
        header: banner.headerEn
          ? this.languageRepository.create({
              nameEn: banner.headerEn,
              nameTh: banner.headerTh,
            })
          : null,
        subtitle: banner.subtitleEn
          ? this.languageRepository.create({
              nameEn: banner.subtitleEn,
              nameTh: banner.subtitleTh,
            })
          : null,
        cta: banner.ctaEn
          ? this.languageRepository.create({
              nameEn: banner.ctaEn,
              nameTh: banner.ctaTh,
            })
          : null,
        overlayColor: banner.overlayColor,
        textColor: banner.textColor,
        assetKey: banner.assetKey,
        href: banner.href,
        sequence: index,
      }),
    );
    const result = await this.promoBannerRepository.save(entities);
    await Promise.allSettled(
      banners2Delete.map((promoBanner) =>
        deleteObjectFromS3(promoBanner.assetKey),
      ),
    );

    return result;
  }
}
