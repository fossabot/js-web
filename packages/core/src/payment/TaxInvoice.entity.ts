/* eslint-disable max-classes-per-file */

import { Entity, Column, ManyToOne, Check } from 'typeorm';

import { Order } from './Order.entity';
import { Base } from '../base/Base.entity';
import { BillingAddress } from './BillingAddress.entity';
import { EMAIL_PATTERN } from '../utils/constants';
import { District } from '../address/District.entity';
import { Subdistrict } from '../address/Subdistrict.entity';
import { Province } from '../address/Province.entity';

export enum TaxType {
  ORGANIZATION = 'ORGANIZATION',
  INDIVIDUAL = 'INDIVIDUAL',
}

export enum OfficeType {
  HEAD_OFFICE = 'HEAD_OFFICE',
  BRANCH = 'BRANCH',
}

export abstract class BaseTaxInvoice extends Base {
  @Column({ type: 'enum', enum: TaxType })
  taxType: TaxType;

  @Column({ type: 'enum', enum: OfficeType })
  officeType: OfficeType;

  @Column({ length: 255, type: 'varchar' })
  taxEntityName: string;

  @Column({ length: 255, type: 'varchar', nullable: true })
  headOfficeOrBranch?: string;

  @Column({ length: 255, type: 'varchar' })
  taxId: string;

  @Column({ type: 'text' })
  taxAddress: string;

  @ManyToOne(() => District, { eager: true })
  district: District;

  @ManyToOne(() => Subdistrict, { eager: true })
  subdistrict: Subdistrict;

  @ManyToOne(() => Province, { eager: true })
  province: Province;

  @Column({ length: 255, type: 'varchar' })
  country: string;

  @Column({ length: 255, type: 'varchar' })
  zipCode: string;

  @Column({ type: 'text' })
  contactPerson: string;

  @Column({ type: 'text' })
  contactPhoneNumber: string;

  @Column({ type: 'citext', name: 'contactemail' })
  @Check('email_check', `contactemail ~* '${EMAIL_PATTERN}'`)
  contactEmail: string;

  @ManyToOne(() => BillingAddress, {
    nullable: true,
    eager: true,
    cascade: true,
    onDelete: 'SET NULL',
  })
  billingAddress: BillingAddress | null;
}

@Entity()
export class TaxInvoice extends BaseTaxInvoice {
  @Column()
  orderId: string;

  @ManyToOne(() => Order, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE',
  })
  order!: Order;
}
