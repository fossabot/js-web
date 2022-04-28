import { Base } from './base';
import { District } from './district';
import { Province } from './province';
import { Subdistrict } from './subdistrict';
import { User } from './user';

export interface GetBillingAddressDto {
  id: string;

  billingAddress: string;

  district: District;

  subdistrict: Subdistrict;

  province: Province;

  country: string;

  isDefault: boolean;
}

export interface UpsertBillingAddressDto {
  id?: string;

  billingAddress: string;

  districtId: number;

  subdistrictId: number;

  provinceId: number;

  country: string;

  isDefault?: boolean;
}

export interface BillingAddress extends Base {
  billingAddress: string;

  district: District;

  subdistrict: Subdistrict;

  province: Province;

  country: string;

  user: User;

  isDefault: boolean;
}
