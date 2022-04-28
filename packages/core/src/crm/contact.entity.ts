// eslint-disable-next-line max-classes-per-file
import {
  Check,
  ChildEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  TableInheritance,
} from 'typeorm';
import { Base } from '../base/Base.entity';
import { EMAIL_PATTERN } from '../utils/constants';
import { Subdistrict } from '../address/Subdistrict.entity';
import { SubscriptionPlan } from '../payment/SubscriptionPlan.entity';

@Entity('contact')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class BaseContact extends Base {
  @Column({ type: 'citext', nullable: true })
  @Check('check_contact_email', `email ~* '${EMAIL_PATTERN}'`)
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  firstname: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  lastname: string;

  @Column({ type: 'varchar', length: 1, nullable: true })
  gender: string;

  @Column({ type: 'varchar', nullable: true })
  salutation: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  companyname: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  jobtitle: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  phoneno: string;

  @Column('varchar', { array: true, default: [''] })
  products: string[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  utm_source: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  utm_medium: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  utm_campaign_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  channel_description: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  tracking: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  cookieid: string;

  @Column({ type: 'varchar', length: 2000, nullable: true })
  leadmessage: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  utm_term: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  utm_content: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  originalurl: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  taggedurl: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stateid: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  sessionid: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  campaginid: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  campaginname: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  promotiondetail: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  leadformurl: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  countryCode: string;

  @Column({ type: 'boolean', nullable: true })
  consent_mkt: boolean;

  @Column({ type: 'boolean', default: false })
  onCRM: boolean;

  @Column({ type: 'varchar', length: 20, nullable: true })
  membertype: string;

  @Column({ type: 'boolean', nullable: true })
  signupmember: boolean;
}

@ChildEntity('retail')
export class ContactRetail extends BaseContact {}

@ChildEntity('corporate')
export class ContactCorporate extends BaseContact {
  @Column({ type: 'varchar', length: 255, nullable: true })
  companyIndustry: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  NoOfEmployee: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  telephone1: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  fax: string;

  @Column({ type: 'citext', nullable: true })
  @Check('check_contact_company_email', `emailcompany ~* '${EMAIL_PATTERN}'`)
  emailcompany: string;
}

@ChildEntity('trial')
export class ContactTrial extends BaseContact {
  @ManyToOne(() => SubscriptionPlan, {
    nullable: true,
    eager: true,
  })
  @JoinColumn({ referencedColumnName: 'productId', name: 'skucode' })
  skucode: SubscriptionPlan;

  @Column({ type: 'varchar', length: 255, nullable: true })
  skuname: string;

  @Column({ type: 'timestamptz', nullable: true })
  packagestartdate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  packageenddate: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  coupon: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  coupontype: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  billingaddressth: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  billingaddressen: string;

  @ManyToOne(() => Subdistrict, {
    nullable: true,
    eager: true,
  })
  billingsubdistrict: Subdistrict;
}
