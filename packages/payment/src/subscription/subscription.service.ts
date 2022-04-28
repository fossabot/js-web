import { isAfter } from 'date-fns';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  IPlanFeatures,
  SubscriptionPlan,
} from '@seaccentral/core/dist/payment/SubscriptionPlan.entity';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { Order } from '@seaccentral/core/dist/payment/Order.entity';
import { Subscription } from '@seaccentral/core/dist/payment/Subscription.entity';
import { Organization } from '@seaccentral/core/dist/organization/Organization.entity';
import { addToDateByPlan } from '@seaccentral/core/dist/utils/date';
import { getLanguageFromDate } from '@seaccentral/core/dist/utils/language';
import { NotificationProducer } from '@seaccentral/core/dist/queue/notification.producer';
import { PushNotificationSubCategoryKey } from '@seaccentral/core/dist/notification/enum/PushNotificationSubCategory.enum';
import { NotificationVariableDict as NV } from '@seaccentral/core/dist/notification/NotificationVariableDict';

export interface ISubscribeParams {
  features?: IPlanFeatures;
}

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    private notificationProducer: NotificationProducer,
  ) {}

  async subscribe(
    user: User,
    plan: SubscriptionPlan,
    params: ISubscribeParams,
    order?: Order,
    organization?: Organization,
  ) {
    const startDate = new Date();

    let endDate = addToDateByPlan(startDate, plan);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const searchParams: any = { user, subscriptionPlan: plan, isActive: true };
    if (organization) {
      searchParams.organization = organization;
    }
    const existingSubscription = await this.subscriptionRepository.findOne({
      where: searchParams,
    });
    // Instead of extending time for current subscription, make it inactive
    // This helps keep track of subscription brought for different time intervals
    if (existingSubscription) {
      existingSubscription.isActive = false;
      await this.subscriptionRepository.save(existingSubscription);

      // Topup from last expiry if expiry is in future.
      if (isAfter(existingSubscription.endDate, startDate)) {
        endDate = addToDateByPlan(existingSubscription.endDate, plan);
      }

      const expiryDate = getLanguageFromDate(endDate, 'dd MMM yyyy');

      this.notificationProducer
        .notify(PushNotificationSubCategoryKey.MEMBERSHIP_RENEWAL, user.id, {
          [NV.PACKAGE_NAME.alias]: plan.displayName || plan.name,
          [NV.MEMBERSHIP_EXPIRY_DATE.alias]: expiryDate,
        })
        .catch();
    } else {
      this.notificationProducer
        .notify(PushNotificationSubCategoryKey.MEMBERSHIP_ACTIVATED, user.id, {
          [NV.PACKAGE_NAME.alias]: plan.displayName || plan.name,
        })
        .catch();
    }

    const subscription = this.subscriptionRepository.create({
      user,
      order,
      endDate,
      startDate,
      organization,
      subscriptionPlan: plan,
      features: params.features,
    });

    return this.subscriptionRepository.save(subscription);
  }

  async getAllForUser(user: User) {
    const subscriptions = await this.subscriptionRepository.find({
      where: { user, isActive: true },
    });

    return subscriptions.filter((s) => !s.subscriptionPlan.isDefaultPackage);
  }
}
