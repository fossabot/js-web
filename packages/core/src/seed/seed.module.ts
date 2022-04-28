import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordSetting } from '../admin/Password.setting.entity';
import { SubscriptionPlan } from '../payment/SubscriptionPlan.entity';
import { LoginSetting } from '../admin/Login.setting.entity';
import { ProductItemRaw } from '../raw-product/ProductItemRaw.entity';

import { SeedService } from './seed.service';
import { UsersModule } from '../user/users.module';
import { UserSeedService } from './userSeedService';
import { ProfileSeedService } from './profileSeed.service';
import { CourseEntityModule } from '../course/courseEntity.module';
import { CatalogMenu } from '../catalog-menu/CatalogMenu.entity';
import { CatalogMenuTopic } from '../catalog-menu/CatalogMenuTopic.entity';
import { CatalogMenuLearningWay } from '../catalog-menu/CatalogMenuLearningWay.entity';
import { Language } from '../language/Language.entity';
import { ProductArRaw } from '../raw-product/ProductArRaw.entity';
import { CouponDetailArRaw } from '../raw-product/CouponDetailArRaw.entity';
import { CouponMasterArRaw } from '../raw-product/CouponMasterArRaw.entity';
import { EligibleSkuCodeArRaw } from '../raw-product/EligibleSkuCodeArRaw.entity';
import { CouponSeedService } from './couponSeed.service';
import { NotificationSeedService } from './notificationSeedService';
import { NotificationEntityModule } from '../notification/NotificationEntity.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PasswordSetting,
      SubscriptionPlan,
      LoginSetting,
      ProductItemRaw,
      CatalogMenu,
      CatalogMenuTopic,
      CatalogMenuLearningWay,
      Language,
      ProductArRaw,
      CouponDetailArRaw,
      CouponMasterArRaw,
      EligibleSkuCodeArRaw,
    ]),
    UsersModule,
    CourseEntityModule,
    NotificationEntityModule,
  ],
  providers: [
    SeedService,
    UserSeedService,
    ProfileSeedService,
    CouponSeedService,
    NotificationSeedService,
  ],
  exports: [
    SeedService,
    UserSeedService,
    ProfileSeedService,
    CouponSeedService,
    NotificationSeedService,
  ],
})
export class SeedModule {}
