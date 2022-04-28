import { Base } from './base';
import { IOrder } from './order';
import { Organization } from './organization';
import { IPlanFeatures, SubscriptionPlan } from './subscriptionPlan';
import { User } from './user';

export interface Subscription extends Base {
  startDate: Date;

  endDate: Date;

  autoRenew: boolean;

  order?: IOrder;

  subscriptionPlanId: string;

  subscriptionPlan: SubscriptionPlan;

  displayName?: string;

  userId: string;

  user: User;

  organizationId?: string;

  organization?: Organization;

  features?: IPlanFeatures;

  instancyUserId?: string;
}
