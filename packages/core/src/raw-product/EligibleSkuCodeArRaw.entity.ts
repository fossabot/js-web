import { Column, Entity, Unique } from 'typeorm';
import { Base } from '../base/Base.entity';

@Entity()
@Unique('sku_code_coupon_code_unique', ['eligibleSkuCode', 'couponCode'])
export class EligibleSkuCodeArRaw extends Base {
  @Column()
  eligibleSkuCode: string;

  @Column({ nullable: true })
  eligibleSkuName: string;

  @Column()
  couponCode: string;
}
