import { Entity, Column, Index, ManyToOne } from 'typeorm';

import { Base } from '../base/Base.entity';
import { ProductCountryRaw } from './ProductCountryRaw.entity';

@Entity()
export class ProductCurrencyRaw extends Base {
  @Column({ nullable: false, unique: true })
  @Index()
  code: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  countryName?: string;

  @ManyToOne(() => ProductCountryRaw, {
    nullable: true,
    eager: true,
  })
  country?: ProductCountryRaw;

  @Column({ nullable: false, default: 'Active' })
  status: string;
}
