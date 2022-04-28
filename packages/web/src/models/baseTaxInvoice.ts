import { Base } from './base';
import { District } from './district';
import { Province } from './province';
import { Subdistrict } from './subdistrict';
import { BillingAddress } from './billingAddress';

export enum TaxType {
  ORGANIZATION = 'ORGANIZATION',
  INDIVIDUAL = 'INDIVIDUAL',
}

export enum OfficeType {
  HEAD_OFFICE = 'HEAD_OFFICE',
  BRANCH = 'BRANCH',
}

export interface BaseTaxInvoice extends Base {
  taxType: TaxType;

  officeType: OfficeType;

  taxEntityName: string;

  headOfficeOrBranch?: string;

  taxId: string;

  taxAddress: string;

  district: District;

  subdistrict: Subdistrict;

  province: Province;

  country: string;

  zipCode: string;

  contactPerson: string;

  contactPhoneNumber: string;

  contactEmail: string;

  billingAddress: BillingAddress | null;
}
