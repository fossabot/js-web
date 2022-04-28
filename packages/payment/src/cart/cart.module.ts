import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { CoreCouponModule } from '@seaccentral/core/dist/coupon/coreCoupon.module';
import { CouponDetailArRaw } from '@seaccentral/core/dist/raw-product/CouponDetailArRaw.entity';
import { CouponMasterArRaw } from '@seaccentral/core/dist/raw-product/CouponMasterArRaw.entity';
import { EligibleSkuCodeArRaw } from '@seaccentral/core/dist/raw-product/EligibleSkuCodeArRaw.entity';

import { CartService } from './cart.service';
import { PlanModule } from '../plan/plan.module';
import { CouponService } from './coupon.service';
import { CartController } from './cart.controller';

@Module({
  imports: [
    CoreCouponModule,
    TypeOrmModule.forFeature([
      CouponDetailArRaw,
      CouponMasterArRaw,
      EligibleSkuCodeArRaw,
    ]),
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
    PlanModule,
  ],
  controllers: [CartController],
  providers: [CouponService, CartService],
  exports: [CouponService, CartService],
})
export class CartModule {}
