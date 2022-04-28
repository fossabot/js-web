export interface IPlan {
  id: string;
  productId: string;
  category: string;
  name: string;
  price: string;
  currency: string;
  siteUrl: string;
  siteId: string;
  packageType: string;
  durationValue: number;
  durationInterval: string;
  memberType: string;
  isActive: boolean;
  isPublic: boolean;
}
