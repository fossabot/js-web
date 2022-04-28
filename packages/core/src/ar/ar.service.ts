import { HttpService, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import {
  retryWhen,
  tap,
  delay,
  concatMap,
  mergeMap,
  take,
} from 'rxjs/operators';
import { Observable, of, from } from 'rxjs';
import { AxiosResponse } from 'axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import { endOfDay, startOfDay, startOfTomorrow } from 'date-fns';
import { nanoid } from 'nanoid';
import { CouponDetailArRaw } from '../raw-product/CouponDetailArRaw.entity';
import { CouponMasterArRaw } from '../raw-product/CouponMasterArRaw.entity';
import { Order } from '../payment/Order.entity';
import { PaymentConsumable } from '../payment/PaymentConsumble';
import { RedeemCouponApiRequest, RedeemCouponApiResponse } from './arApi';
import { ARFailedOrder, IFailReason } from './ARFailedOrder.entity';
import { dateToUTCDate } from '../utils/date';

@Injectable()
export class ARService implements PaymentConsumable {
  private readonly logger = new Logger(ARService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @InjectRepository(CouponDetailArRaw)
    private readonly couponDetailArRawRepository: Repository<CouponDetailArRaw>,
    @InjectRepository(CouponMasterArRaw)
    private readonly couponMasterArRawRepository: Repository<CouponMasterArRaw>,
    @InjectRepository(ARFailedOrder)
    private readonly arFailedOrderRepository: Repository<ARFailedOrder>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async onPaymentSuccess(order: Order) {
    const { couponId } = order;
    if (!couponId) {
      return order;
    }
    if (!order.dealId) {
      this.logger.warn(`Order: ${order.id} doesn't have dealId, skipped`);
      return order;
    }
    const coupon = await this.couponDetailArRawRepository.findOneOrFail({
      id: couponId,
    });
    const couponMain = await this.couponMasterArRawRepository.findOneOrFail({
      couponCode: coupon.couponCode,
    });
    const endpoint = this.configService.get('AR_COUPON_PATH');
    const username = this.configService.get('AR_USERNAME');
    const password = this.configService.get('AR_PASSWORD');
    const payload: RedeemCouponApiRequest = {
      CouponCode: couponMain.couponCode,
      CouponUniqueNo: coupon.couponUniqueNo,
      Quantity: 1,
      DealID: order.dealId,
    };
    this.logger.log('AR redeem coupon api payload', JSON.stringify(payload));
    try {
      await this.httpService
        .post<RedeemCouponApiResponse>(endpoint, payload, {
          headers: {
            Authorization: `Basic ${btoa(`${username}:${password}`)}`,
          },
        })
        .pipe(
          retryWhen(
            (axiosError: Observable<AxiosResponse<RedeemCouponApiResponse>>) =>
              axiosError.pipe(
                tap((res) =>
                  this.logger.log(
                    'Failed to post payment to AR',
                    JSON.stringify({
                      error: res.data,
                      couponId: coupon.id,
                      orderId: order.id,
                    }),
                  ),
                ),
                delay(3 * 1000),
                take(3),
                concatMap(async (error, attempt) => {
                  const maxAttempt = 3;
                  if (attempt >= maxAttempt - 1) {
                    throw error;
                  }
                }),
              ),
          ),
        )
        .toPromise();
      return order;
    } catch (error) {
      if (error.response) {
        const { status, headers, data } = error.response;
        await this.scheduleMidnight(order, { status, headers, data });
      }
      return null;
    }
  }

  private async scheduleMidnight(order: Order, reason?: IFailReason) {
    await this.arFailedOrderRepository.upsert(
      {
        order,
        dueRetry: dateToUTCDate(startOfTomorrow()),
        reason,
      },
      ['orderId'],
    );
    await this.arFailedOrderRepository.increment({ order }, 'attempt', 1);
  }

  private async removeFromSchedule(order: Order) {
    await this.arFailedOrderRepository.delete({ order });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async retryFailedCouponARRequest() {
    const now = dateToUTCDate(new Date());
    const orders = await this.arFailedOrderRepository.find({
      dueRetry: Between(startOfDay(now), endOfDay(now)),
    });
    const concurrency = 10;
    from(orders)
      .pipe(
        mergeMap(
          (arOrder) => this.onPaymentSuccess(arOrder.order),
          concurrency,
        ),
        tap((order) => order && this.removeFromSchedule(order)),
      )
      .subscribe();
  }

  onPaymentFailure() {
    return Promise.resolve();
  }
}
