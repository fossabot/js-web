import { Column, Entity } from 'typeorm';
import { Base } from '../base/Base.entity';

@Entity()
export class CouponDetailArRaw extends Base {
  @Column()
  couponCode: string;

  @Column({ unique: true })
  couponUniqueNo: string;

  @Column({ type: 'timestamptz' })
  systemCreatedDate: Date;

  @Column()
  used: boolean;
}
