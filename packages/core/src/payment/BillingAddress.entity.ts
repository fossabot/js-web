import { Entity, Column, ManyToOne, Check } from 'typeorm';

import { Base } from '../base/Base.entity';
import { EMAIL_PATTERN } from '../utils/constants';
import { User } from '../user/User.entity';
import { District } from '../address/District.entity';
import { Subdistrict } from '../address/Subdistrict.entity';
import { Province } from '../address/Province.entity';

export enum OfficeType {
  HEAD_OFFICE,
  BRANCH,
}

@Entity()
export class BillingAddress extends Base {
  @Column({ type: 'text' })
  billingAddress: string;

  @ManyToOne(() => District, { eager: true })
  district: District;

  @ManyToOne(() => Subdistrict, { eager: true })
  subdistrict: Subdistrict;

  @ManyToOne(() => Province, { eager: true })
  province: Province;

  @Column({ length: 255, type: 'varchar' })
  country: string;

  @ManyToOne(() => User, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE',
  })
  user!: User;

  @Column()
  isDefault: boolean;
}
