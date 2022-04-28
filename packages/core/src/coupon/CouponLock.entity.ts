import { Column, Entity, ManyToOne, Unique } from 'typeorm';

import { Base } from '../base/Base.entity';
import { User } from '../user/User.entity';
import { CouponDetailArRaw } from '../raw-product/CouponDetailArRaw.entity';

@Entity()
@Unique('coupon_lock_unique', ['userId', 'couponDetailId'])
export class CouponLock extends Base {
  @Column({ nullable: false })
  couponDetailId!: string;

  @Column({ nullable: false })
  userId!: string;

  @ManyToOne(() => CouponDetailArRaw, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE',
  })
  couponDetail!: CouponDetailArRaw;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user!: User;

  @Column({ type: 'timestamptz', nullable: false })
  expiresOn!: Date;
}
