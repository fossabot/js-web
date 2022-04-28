import {
  PrimaryColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  BaseEntity,
  Entity,
  Index,
} from 'typeorm';

@Entity()
@Index('province_id_search_index', ['provinceId'])
export class District extends BaseEntity {
  @PrimaryColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  districtCode: string;

  @Column({ type: 'varchar', length: 255 })
  districtNameEn: string;

  @Column({ type: 'varchar', length: 255 })
  districtNameTh: string;

  @Column()
  provinceId: number;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
