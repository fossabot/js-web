import { Entity, Column, Index, ManyToOne } from 'typeorm';

import { Base } from '../base/Base.entity';
import { ProductGroupRaw } from './ProductGroupRaw.entity';
import { ProductSubGroupRaw } from './ProductSubGroupRaw.entity';

@Entity()
export class ProductSKUGroupRaw extends Base {
  @Column({ nullable: false, unique: true })
  @Index()
  code: string;

  @Column({ nullable: false })
  name: string;

  @ManyToOne(() => ProductGroupRaw, {
    nullable: true,
    eager: true,
  })
  productGroup?: ProductGroupRaw;

  @ManyToOne(() => ProductSubGroupRaw, {
    nullable: true,
    eager: true,
  })
  productSubGroup?: ProductSubGroupRaw;

  @Column({ nullable: false, default: 'Active' })
  status: string;
}
