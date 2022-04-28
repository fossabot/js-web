import { Entity, Column, Index, ManyToOne } from 'typeorm';

import { Base } from '../base/Base.entity';
import { ProductGroupRaw } from './ProductGroupRaw.entity';

@Entity()
export class ProductSubGroupRaw extends Base {
  @Column({ nullable: false, unique: true })
  @Index()
  code: string;

  @Column({ nullable: false })
  name: string;

  @ManyToOne(() => ProductGroupRaw, {
    nullable: false,
    eager: true,
  })
  productGroup: ProductGroupRaw;

  @Column({ nullable: false, default: 'Active' })
  status: string;
}
