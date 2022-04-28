import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Subscription } from '@seaccentral/core/dist/payment/Subscription.entity';
import { FindOneOptions, Repository, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {}

  async getByCourseOutline(
    userIds: string[],
    courseOutlineId: string,
    order?: FindOneOptions<Subscription>['order'],
  ) {
    return this.subscriptionRepository.find({
      join: {
        alias: 'subscription',
        leftJoin: {
          subscriptionPlan: 'subscription.subscriptionPlan',
          courseOutlineBundle: 'subscriptionPlan.courseOutlineBundle',
          courseOutline: 'courseOutlineBundle.courseOutline',
        },
      },
      where: (qb: SelectQueryBuilder<Subscription>) => {
        qb.where('"userId" IN (:...userIds)')
          .andWhere('"courseOutline"."id" = :courseOutlineId')
          .setParameters({ userIds, courseOutlineId });
      },
      order,
    });
  }
}
