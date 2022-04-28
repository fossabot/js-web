import { Entity, Column, Index } from 'typeorm';

import { Base } from '../base/Base.entity';

@Entity()
export class ProductCountryRaw extends Base {
  @Column({ nullable: false, unique: true })
  @Index()
  code: string;

  @Column({ nullable: false })
  eligibleCountryName: string;

  @Column({ nullable: false, default: 'Active' })
  status: string;
}
