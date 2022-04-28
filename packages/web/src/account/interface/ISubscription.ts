export interface ISubscription {
  id: string;
  subscriptionPlan: ISubscriptionPlan;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface ISubscriptionPlan {
  id: string;
  name: string;
  siteUrl: string;
  isActive: boolean;
}

export interface IPackageItemProps {
  subscription: ISubscription;
  expired?: boolean;
}
