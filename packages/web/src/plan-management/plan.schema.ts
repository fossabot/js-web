import * as Yup from 'yup';
import {
  ExternalPackageProviderType,
  InstancyPackageType,
  SubscriptionPlanCategory,
} from '../models/subscriptionPlan';

const planSchema = Yup.object({
  productId: Yup.string().required('required'),
  category: Yup.string()
    .oneOf([
      SubscriptionPlanCategory.LIFETIME,
      SubscriptionPlanCategory.SUBSCRIPTION,
    ])
    .required('required'),
  name: Yup.string().required('required'),
  price: Yup.string().required('required'),
  currency: Yup.string().required('required'),
  externalProviderType: Yup.string()
    .oneOf([ExternalPackageProviderType.INSTANCY, null])
    .optional()
    .nullable(),
  vatRate: Yup.string().required('required'),
  durationValue: Yup.number().required('required'),
  durationInterval: Yup.string().oneOf(['day']).required('required'),
  // Instancy related fields
  packageType: Yup.string()
    .oneOf([
      InstancyPackageType.ALL_ACCESS,
      InstancyPackageType.ONLINE,
      InstancyPackageType.VIRTUAL,
      null,
    ])
    .optional()
    .nullable(),
  siteUrl: Yup.string().nullable().optional(),
  siteId: Yup.string().nullable().optional(),
  memberType: Yup.string().nullable().optional(),
  durationName: Yup.string().nullable().optional(),
  membershipId: Yup.string().nullable().optional(),
  membershipDurationId: Yup.string().nullable().optional(),
  isActive: Yup.boolean().required('required'),
  isPublic: Yup.boolean().required('required'),
  isDefaultPackage: Yup.boolean().required('required'),
});

export default planSchema;
