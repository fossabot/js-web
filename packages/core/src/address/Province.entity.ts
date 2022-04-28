import {
  PrimaryColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  BaseEntity,
  Entity,
} from 'typeorm';

@Entity()
export class Province extends BaseEntity {
  @PrimaryColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  provinceCode: string;

  @Column({ type: 'varchar', length: 255 })
  provinceNameEn: string;

  @Column({ type: 'varchar', length: 255 })
  provinceNameTh: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
