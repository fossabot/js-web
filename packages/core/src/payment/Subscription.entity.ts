import { Column, Entity, ManyToOne } from 'typeorm';

import { Order } from './Order.entity';
import { User } from '../user/User.entity';
import { Base } from '../base/Base.entity';
import { Organization } from '../organization/Organization.entity';
import { IPlanFeatures, SubscriptionPlan } from './SubscriptionPlan.entity';

@Entity()
export class Subscription extends Base {
  @Column('timestamptz')
  startDate: Date;

  @Column('timestamptz')
  endDate: Date;

  @Column({ default: false, nullable: false })
  autoRenew!: boolean;

  @ManyToOne(() => Order, { nullable: true, eager: false })
  order?: Order;

  @Column()
  subscriptionPlanId: string;

  @ManyToOne(() => SubscriptionPlan, {
    nullable: false,
    eager: true,
  })
  subscriptionPlan!: SubscriptionPlan;

  @Column({ nullable: true })
  displayName?: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, {
    nullable: false,
    eager: false,
    onDelete: 'CASCADE',
  })
  user!: User;

  @Column({ nullable: true })
  organizationId?: string;

  // If the plan is brought for an organization
  @ManyToOne(() => Organization, {
    nullable: true,
    eager: false,
  })
  organization?: Organization;

  @Column({
    type: 'jsonb',
    default: null,
    nullable: true,
  })
  features?: IPlanFeatures;

  // Instancy related fields
  @Column({ nullable: true })
  instancyUserId?: string;
}
