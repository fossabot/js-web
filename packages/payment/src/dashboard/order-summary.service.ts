import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Order,
  OrderStatus,
} from '@seaccentral/core/dist/payment/Order.entity';
import { Transaction } from '@seaccentral/core/dist/payment/Transaction.entity';
import { Between, In, Repository } from 'typeorm';
import { groupBy } from 'lodash';
import { isAfter } from 'date-fns';
import { addToDateByPlan } from '@seaccentral/core/dist/utils/date';
import { PAYMENT_STATUS_RESPONSE_CODE } from '../constants/payment';
import { PeriodQuery } from './period-query.dto';

export interface INewUser {
  userId: string;
  subscriptionIds: string[];
}

export interface IRenewUser {
  userId: string;
  totalSubscription: number;
}

export interface IExpiredUser {
  userId: string;
  totalSubscription: number;
}

export interface IPackageType {
  packageType: string;
}

export interface IMemberType {
  memberType: string;
}

@Injectable()
export class OrderSummaryService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async newUser(period: PeriodQuery): Promise<INewUser[]> {
    const result = await this.orderRepository
      .createQueryBuilder('order')
      .select('order.user.id', 'userId')
      .addSelect('order.subscriptionPlan', 'subscriptionId')
      .leftJoin('order.subscriptionPlan', 'subscriptionPlan')
      .leftJoin('order.user', 'user')
      .where({
        status: OrderStatus.COMPLETED,
        createdAt: Between(period.fromDate, period.toDate),
      })
      .groupBy('order.user.id')
      .addGroupBy('order.subscriptionPlan')
      .having('COUNT(order.subscriptionPlan) = 1')
      .getRawMany<{ userId: string; subscriptionId: string }>();

    const userGroupSubscription = groupBy(result, (value) => value.userId);
    return Object.keys(userGroupSubscription).map((userId: string) => ({
      userId,
      subscriptionIds: userGroupSubscription[userId].map(
        (value) => value.subscriptionId,
      ),
    }));
  }

  async renewUser(period: PeriodQuery) {
    const result = await this.orderRepository
      .createQueryBuilder('order')
      .select('order.user.id', 'userId')
      .addSelect('COUNT(order.subscriptionPlan)::int', 'totalSubscription')
      .leftJoin('order.subscriptionPlan', 'subscriptionPlan')
      .leftJoin('order.user', 'user')
      .where({
        status: OrderStatus.COMPLETED,
        createdAt: Between(period.fromDate, period.toDate),
      })
      .groupBy('order.user.id')
      .addGroupBy('order.subscriptionPlan')
      .having('COUNT(order.subscriptionPlan) > 1')
      .getRawMany<IRenewUser>();

    return result;
  }

  async expiredSubscription(period: PeriodQuery): Promise<IExpiredUser[]> {
    const now = new Date();
    const inRangeOrders = await this.orderRepository.find({
      relations: ['subscriptionPlan'],
      where: {
        status: OrderStatus.COMPLETED,
        createdAt: Between(period.fromDate, period.toDate),
      },
    });

    const orderWithExpiredPlans = inRangeOrders.filter((order) => {
      const { createdAt } = order;
      const expirationDate = addToDateByPlan(createdAt, order.subscriptionPlan);

      return isAfter(now, expirationDate);
    });

    const orderGroupByUserId = groupBy(
      orderWithExpiredPlans,
      (value) => value.userId,
    );
    return Object.keys(orderGroupByUserId).map((userId) => ({
      userId,
      totalSubscription: orderGroupByUserId[userId].length,
    }));
  }

  async unsuccessfulPayment(period: PeriodQuery) {
    const result = await this.orderRepository.find({
      where: {
        status: In([OrderStatus.FAILED, OrderStatus.CANCELED]),
        createdAt: Between(period.fromDate, period.toDate),
      },
    });

    return result;
  }

  async packageType(period: PeriodQuery) {
    const result = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoin('order.subscriptionPlan', 'subscriptionPlan')
      .select('subscriptionPlan.packageType', 'packageType')
      .where({
        status: OrderStatus.COMPLETED,
        createdAt: Between(period.fromDate, period.toDate),
      })
      .andWhere('subscriptionPlan.memberType IS NOT NULL')
      .distinctOn(['subscriptionPlan.packageType'])
      .getRawMany<IPackageType>();

    return result;
  }

  async memberType(period: PeriodQuery) {
    const result = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoin('order.subscriptionPlan', 'subscriptionPlan')
      .select('subscriptionPlan.memberType', 'memberType')
      .where({
        status: OrderStatus.COMPLETED,
        createdAt: Between(period.fromDate, period.toDate),
      })
      .andWhere('subscriptionPlan.memberType IS NOT NULL')
      .distinctOn(['subscriptionPlan.memberType'])
      .getRawMany<IMemberType>();

    return result;
  }

  async revenue(period: PeriodQuery) {
    const result = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount::int)', 'totalRevenue')
      .where({
        status: PAYMENT_STATUS_RESPONSE_CODE.PAYMENT_SUCCESSFUL,
        createdAt: Between(period.fromDate, period.toDate),
      })
      .getRawOne<{ totalRevenue: number }>();

    return (result?.totalRevenue || 0) / 100;
  }
}
