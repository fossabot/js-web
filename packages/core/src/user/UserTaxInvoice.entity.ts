import { Entity, Column, ManyToOne } from 'typeorm';

import { BaseTaxInvoice } from '../payment/TaxInvoice.entity';
import { User } from './User.entity';

@Entity()
export class UserTaxInvoice extends BaseTaxInvoice {
  @ManyToOne(() => User)
  user: User;

  @Column()
  isDefault: boolean;
}
