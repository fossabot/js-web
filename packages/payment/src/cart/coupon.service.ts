import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DeleteResult, ILike, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { isNumberString } from 'class-validator';
import { InjectRepository } from '@nestjs/typeorm';
import {
  addMinutes,
  differenceInHours,
  differenceInSeconds,
  differenceInMinutes,
} from 'date-fns';

import { User } from '@seaccentral/core/dist/user/User.entity';
import { ERROR_CODES } from '@seaccentral/core/dist/error/errors';
import { CouponLock } from '@seaccentral/core/dist/coupon/CouponLock.entity';
import { SubscriptionPlan } from '@seaccentral/core/dist/payment/SubscriptionPlan.entity';
import { CouponDetailArRaw } from '@seaccentral/core/dist/raw-product/CouponDetailArRaw.entity';
import { CouponMasterArRaw } from '@seaccentral/core/dist/raw-product/CouponMasterArRaw.entity';
import { EligibleSkuCodeArRaw } from '@seaccentral/core/dist/raw-product/EligibleSkuCodeArRaw.entity';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(CouponDetailArRaw)
    private readonly couponDetailArRawRepository: Repository<CouponDetailArRaw>,
    @InjectRepository(CouponMasterArRaw)
    private readonly couponMasterArRawRepository: Repository<CouponMasterArRaw>,
    @InjectRepository(EligibleSkuCodeArRaw)
    private readonly eligibleSkuCodeArRawRepository: Repository<EligibleSkuCodeArRaw>,
    @InjectRepository(CouponLock)
    private readonly couponLockRepository: Repository<CouponLock>,
    private readonly configService: ConfigService,
  ) {}

  async getValidCoupon(uniqueNo: string, plan: SubscriptionPlan, user: User) {
    const coupon = await this.couponDetailArRawRepository.findOne({
      couponUniqueNo: ILike(uniqueNo),
    });

    if (!coupon) {
      throw new NotFoundException({ ...ERROR_CODES.COUPON_NOT_FOUND });
    }

    await this.validateCoupon(coupon, plan);
    await this.validateExistingCouponLocks(coupon, user);

    return coupon;
  }

  async validateCoupon(
    individualCoupon: CouponDetailArRaw,
    plan: SubscriptionPlan,
  ) {
    if (individualCoupon.used) {
      throw new ConflictException({ ...ERROR_CODES.COUPON_REDEMPTION_EXCEED });
    }

    const couponMain = await this.couponMasterArRawRepository.findOne({
      couponCode: individualCoupon.couponCode,
    });

    if (!couponMain) {
      throw new BadRequestException({ ...ERROR_CODES.COUPON_INVALID });
    }

    if (couponMain.status !== 'Active') {
      throw new BadRequestException({ ...ERROR_CODES.COUPON_INVALID });
    }

    if (couponMain.startDate && couponMain.endDate) {
      const couponStartDate = new Date(couponMain.startDate);
      const couponEndDate = new Date(couponMain.endDate);

      if (
        differenceInHours(new Date(), couponStartDate) <= 0 ||
        differenceInHours(couponEndDate, new Date()) <= 0
      ) {
        throw new BadRequestException({ ...ERROR_CODES.COUPON_INVALID });
      }
    }

    if (couponMain.eligibleSkuType.toLowerCase() === 'By SKU'.toLowerCase()) {
      const eligibleSku = await this.eligibleSkuCodeArRawRepository.findOne({
        where: { couponCode: couponMain.couponCode },
      });

      if (eligibleSku && plan.productId !== eligibleSku.eligibleSkuCode) {
        throw new BadRequestException({ ...ERROR_CODES.COUPON_INVALID });
      }
    }

    return true;
  }

  async validateExistingCouponLocks(coupon: CouponDetailArRaw, user: User) {
    const couponLocks = await this.couponLockRepository.find({
      where: { couponDetail: { id: coupon.id } },
    });

    if (!couponLocks.length) {
      return true;
    }

    const nonExpiredLocks = couponLocks.filter(
      (cl) => differenceInSeconds(new Date(cl.expiresOn), new Date()) > 0,
    );
    const nonExpiredLocksForCurrentUser = nonExpiredLocks.filter(
      (cl) => cl.userId === user.id,
    );

    if (nonExpiredLocks.length === nonExpiredLocksForCurrentUser.length) {
      return true;
    }

    throw new ConflictException({ ...ERROR_CODES.COUPON_REDEMPTION_EXCEED });
  }

  async lockCouponForUser(coupon: CouponDetailArRaw, user: User) {
    await this.validateExistingCouponLocks(coupon, user);
    const couponLock = await this.couponLockRepository.findOne({
      where: { couponDetail: { id: coupon.id }, user: { id: user.id } },
    });

    if (
      couponLock &&
      differenceInMinutes(new Date(couponLock.expiresOn), new Date()) >= 5
    ) {
      return couponLock;
    }

    const newCouponLock = this.couponLockRepository.create({
      user,
      couponDetail: coupon,
      expiresOn: addMinutes(
        new Date(),
        this.configService.get<number>('COUPON_TIMEOUT_MINUTE') || 60,
      ),
    });
    await this.couponLockRepository.upsert(newCouponLock, {
      conflictPaths: ['userId', 'couponDetailId'],
    });

    await newCouponLock.reload();
    return newCouponLock;
  }

  async getDiscount(
    individualCoupon: CouponDetailArRaw,
    plan: SubscriptionPlan,
  ) {
    const couponInfo = await this.couponMasterArRawRepository.findOne({
      couponCode: individualCoupon.couponCode,
    });
    if (!couponInfo) {
      throw new InternalServerErrorException(
        `coupon master code: ${individualCoupon.couponCode} not found. Please make sure AR pushes this record`,
      );
    }
    const { discountUom, promotion } = couponInfo;

    if (!isNumberString(promotion)) {
      throw new InternalServerErrorException(
        'coupon master promotion is not a number',
      );
    }
    if (discountUom === 'THB') {
      return +promotion;
    }
    if (discountUom === '%') {
      return (+plan.price * +promotion) / 100;
    }
    return 0;
  }

  async markCouponAsUsed(id: string) {
    const couponDetail = await this.couponDetailArRawRepository.findOne(id);

    if (!couponDetail || couponDetail.used) return;

    couponDetail.used = true;
    await this.couponDetailArRawRepository.save(couponDetail);
  }

  unlockCoupons(couponDetailId: string, userId: string): Promise<DeleteResult> {
    return this.couponLockRepository.delete({ couponDetailId, userId });
  }
}
