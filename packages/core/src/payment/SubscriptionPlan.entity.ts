import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
  Unique,
} from 'typeorm';
import { Base } from '../base/Base.entity';
import { CourseOutlineBundle } from '../course/CourseOutlineBundle.entity';
import { Organization } from '../organization/Organization.entity';
import { ProductArRaw } from '../raw-product/ProductArRaw.entity';

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

@Entity()
@Unique('subscription_plan_productId_unique', ['productId'])
export class SubscriptionPlan extends Base {
  @Column({ nullable: false })
  name!: string;

  @Column({ nullable: true })
  displayName?: string;

  // Redundant field for ProductSKURaw.code
  @Column({ nullable: false })
  productId!: string;

  @Column({ nullable: true })
  productSKUId: string;

  // keep nullable for referencing subscription plan from old ar
  // but keeps field defined because we'll use new ar afterwards
  @OneToOne(() => ProductArRaw, { nullable: true, eager: true })
  @JoinColumn()
  productSKU: ProductArRaw;

  @Column({ type: 'text', nullable: true })
  detail?: string;

  // Redundant field for ProductSKURaw.price
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: false })
  price!: string;

  @Column({ type: 'decimal', nullable: false, default: 7 })
  vatRate!: string;

  @Column({ nullable: false })
  currency!: string;

  @Column({
    type: 'enum',
    enum: SubscriptionPlanCategory,
    default: SubscriptionPlanCategory.SUBSCRIPTION,
    nullable: false,
  })
  category!: SubscriptionPlanCategory;

  @Column({ nullable: true })
  durationValue?: number;

  @Column({ type: 'enum', enum: DurationInterval, nullable: true })
  durationInterval?: DurationInterval;

  @Column({ default: 0 })
  periodDay: number;

  @Column({ default: 0 })
  periodMonth: number;

  @Column({ default: 0 })
  periodYear: number;

  @Column({ default: true, nullable: false })
  isPublic!: boolean;

  @Column({ default: false, nullable: false })
  allowRenew!: boolean;

  @Column({ default: false, nullable: false })
  isDefaultPackage!: boolean;

  @Column({
    type: 'jsonb',
    default: {},
  })
  features!: IPlanFeatures;

  @Column({ type: 'enum', enum: ExternalPackageProviderType, nullable: true })
  externalProviderType?: ExternalPackageProviderType | null;

  @ManyToOne(() => Organization, {
    nullable: true,
    eager: true,
  })
  externalProvider?: Organization;

  @ManyToMany(
    () => CourseOutlineBundle,
    (courseOutlineBundle) => courseOutlineBundle.subscriptionPlan,
  )
  @JoinTable({ name: 'plan_course_bundle_item' })
  courseOutlineBundle: CourseOutlineBundle[];

  // Instancy platform related fields
  @Column({ nullable: true })
  siteUrl?: string;

  @Column({ nullable: true })
  siteId?: string;

  @Column({ nullable: true, type: 'enum', enum: InstancyPackageType })
  packageType?: InstancyPackageType | null;

  @Column({ nullable: true })
  memberType?: string;

  @Column({ nullable: true })
  durationName?: string;

  @Column({ nullable: true })
  membershipId?: string;

  @Column({ nullable: true })
  membershipDurationId?: string;
}
