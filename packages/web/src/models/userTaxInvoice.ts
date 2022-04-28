import { BaseTaxInvoice } from './baseTaxInvoice';
import { User } from './user';

export interface UserTaxInvoice extends BaseTaxInvoice {
  user: User;

  isDefault: boolean;
}
