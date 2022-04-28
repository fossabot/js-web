import { Entity, Column, Index } from 'typeorm';

import { Base } from '../base/Base.entity';

@Entity()
export class ProductItemRaw extends Base {
  @Column({ nullable: false, unique: true })
  @Index()
  code: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false, default: 'Active' })
  itemStatus: string;

  @Column({
    nullable: false,
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  productExpiryDate: Date;

  @Column({ nullable: true })
  language?: string;

  @Column({ nullable: true })
  scheduleType?: string;

  @Column({ nullable: false, default: 'Active' })
  status: string;
}
