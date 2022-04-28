import {
  Controller,
  Get,
  Param,
  UseGuards,
  Query,
  Req,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import IRequestWithUser from '@seaccentral/core/dist/user/IRequestWithUser';
import { BaseResponseDto } from '@seaccentral/core/dist/dto/BaseResponse.dto';

import { CartService } from './cart.service';
import { CouponService } from './coupon.service';
import { PlanService } from '../plan/plan.service';
import { CouponCodeDto } from './dto/CouponCode.dto';
import { CartResponseDto } from './dto/CartResponse.dto';

@Controller('v1/cart')
export class CartController {
  constructor(
    private readonly planService: PlanService,
    private readonly couponService: CouponService,
    private readonly cartService: CartService,
  ) {}

  @Get('coupon')
  @UseGuards(JwtAuthGuard)
  async getCoupon(@Query() dto: CouponCodeDto, @Req() req: IRequestWithUser) {
    const plan = await this.planService.getById(dto.planId);
    const coupon = await this.couponService.getValidCoupon(
      dto.couponCode,
      plan,
      req.user,
    );

    const response = new BaseResponseDto<CartResponseDto>();
    const discountValue = await this.couponService.getDiscount(coupon, plan);
    const couponLock = await this.couponService.lockCouponForUser(
      coupon,
      req.user,
    );

    response.data = {
      plan,
      total: this.cartService.total(plan, discountValue),
      coupon: {
        coupon,
        lockExpiresOn: couponLock.expiresOn,
      },
    };

    return response;
  }

  @Delete('coupon/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancelCoupon(@Param('id') id: string, @Req() req: IRequestWithUser) {
    await this.couponService.unlockCoupons(id, req.user.id);
  }

  @Get(':planId')
  @UseGuards(JwtAuthGuard)
  async getCartPlan(@Param('planId') planId: string) {
    const response = new BaseResponseDto<CartResponseDto>();
    const plan = await this.planService.getPublicPlanById(planId);

    response.data = {
      plan,
      total: this.cartService.total(plan),
    };

    return response;
  }
}
