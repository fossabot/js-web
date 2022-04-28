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
@Index('subdistrict_province_id_search_index', ['provinceId'])
@Index('subdistrict_district_id_search_index', ['districtId'])
export class Subdistrict extends BaseEntity {
  @PrimaryColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  subdistrictCode: string;

  @Column({ type: 'varchar', length: 255 })
  subdistrictNameEn: string;

  @Column({ type: 'varchar', length: 255 })
  subdistrictNameTh: string;

  @Column({ type: 'varchar', length: 255 })
  zipCode: string;

  @Column()
  provinceId: number;

  @Column()
  districtId: number;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
