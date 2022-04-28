import { PartialCourseOutlineBundle } from './course';
import { Organization } from './organization';

export enum SubscriptionPlanCategory {
  SUBSCRIPTION = 'subscription',
  LIFETIME = 'lifetime',
}

export enum ExternalPackageProviderType {
  INSTANCY = 'instancy',
}

export enum DurationInterval {
  DAY = 'day',
  MONTH = 'month',
  YEAR = 'year',
}

export interface IPlanFeatures {
  maxUsers?: number;
}

export enum InstancyPackageType {
  ALL_ACCESS = 'all_access',
  ONLINE = 'online',
  VIRTUAL = 'virtual',
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  productId: string;
  detail?: string;
  price: string;
  vatRate: string;
  currency: string;
  category: SubscriptionPlanCategory;
  durationValue?: number;
  durationInterval?: DurationInterval;
  periodDay: number;
  periodMonth: number;
  periodYear: number;
  isPublic: boolean;
  allowRenew: boolean;
  features?: IPlanFeatures;
  externalProviderType?: ExternalPackageProviderType;
  externalProvider?: Organization;
  siteUrl?: string;
  siteId?: string;
  packageType?: InstancyPackageType;
  memberType?: string;
  durationName?: string;
  membershipId?: string;
  membershipDurationId?: string;
  isActive: boolean;
  isDefaultPackage: boolean;
  courseOutlineBundle?: PartialCourseOutlineBundle[];
}
