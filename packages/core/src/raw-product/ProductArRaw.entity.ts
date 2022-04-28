import { Column, Entity } from 'typeorm';
import { Base } from '../base/Base.entity';

export enum ProductAvailability {
  Available = 'Available',
  Terminated = 'Terminated',
  Testing = 'Testing',
  Developing = 'Developing',
}

export enum ShelfLife {
  Regular = 'Regular',
  Seasonal = 'Seasonal',
}

export enum RevenueType {
  ProjectBase = 'Project Base',
  Subscription = 'Subscription',
  Other = 'Other',
}

export enum ThirdPartyLicenseFee {
  NonLicense = 'Non License',
  License = 'License',
}

@Entity()
export class ProductArRaw extends Base {
  @Column()
  productGroup: string;

  @Column()
  subProductGroup: string;

  @Column()
  partner: string;

  @Column()
  deliveryFormat: string;

  @Column()
  itemCategory: string;

  @Column({ unique: true })
  no: string;

  @Column()
  description: string;

  @Column()
  periodYear: number;

  @Column()
  periodMonth: number;

  @Column()
  periodDay: number;

  @Column()
  baseUnitOfMeasure: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  unitPrice: string;

  @Column()
  currency: string;

  @Column()
  countryRegionOfOriginCode: string;

  @Column()
  productAvailability: string;

  @Column()
  shelfLife: string;

  @Column()
  revenueType: string;

  @Column()
  thirdPartyLicenseFee: string;
}
