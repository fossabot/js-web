import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UsersModule } from '@seaccentral/core/dist/user/users.module';
import { RedisCacheModule } from '@seaccentral/core/dist/redis/redisCache.module';
import { PromoBannerEntityModule } from '@seaccentral/core/dist/promo-banner/PromoBannerEntity.module';

import { UploadModule } from '../upload/upload.module';
import { PromoBannerService } from './promoBanner.service';
import { PromoBannerController } from './promoBanner.controller';

@Module({
  imports: [
    PromoBannerEntityModule,
    UsersModule,
    UploadModule,
    RedisCacheModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get('JWT_EXPIRATION_TIME_IN_SECONDS')}s`,
        },
      }),
    }),
  ],
  controllers: [PromoBannerController],
  providers: [PromoBannerService],
})
export class PromoBannerModule {}
