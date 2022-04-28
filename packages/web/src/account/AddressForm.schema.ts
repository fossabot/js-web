import { OfficeType, TaxType } from '../models/baseTaxInvoice';
import { District } from '../models/district';
import { Province } from '../models/province';
import { Subdistrict } from '../models/subdistrict';
import * as Yup from 'yup';
import { EMAIL_PATTERN, TAX_ID, TH_PHONE_REGEX } from '../constants/regex';

export enum BillingAddressOption {
  SAME_AS_INVOICE = 'SAME_AS_INVOICE',
  ADD_NEW = 'ADD_NEW',
}

export interface AddressFormSchema {
  taxType: TaxType;
  taxEntityName: string;
  officeType: OfficeType;
  branch: string;
  taxId: string;
  taxCountry: string;
  taxProvince: Province;
  taxDistrict: District;
  taxSubdistrict: Subdistrict;
  taxPostalCode: Subdistrict;
  taxAddress: string;
  taxContactPerson: string;
  taxContactEmail: string;
  taxContactPhoneNumber: string;
  billingOption: BillingAddressOption;
  billingCountry: string;
  billingProvince: Province;
  billingDistrict: District;
  billingSubdistrict: Subdistrict;
  billingPostalCode: Subdistrict;
  billingAddress: string;
}
const isNewBilling = (billingOption: BillingAddressOption) =>
  billingOption === BillingAddressOption.ADD_NEW;
const requiredMsg = 'addressEditPage.required';
const emailMsg = 'addressEditPage.mustBeValidEmail';
const invalidPhoneNumberMsg = 'addressEditPage.invalidPhoneNumber';
const invalidTaxIdMsg = 'addressEditPage.pleaseEnterValidTaxId';

export const addressFormSchema = Yup.object().shape({
  taxType: Yup.string().trim().required(requiredMsg),
  taxEntityName: Yup.string().trim().required(requiredMsg),
  officeType: Yup.string().trim().required(requiredMsg),
  branch: Yup.string()
    .trim()
    .when('officeType', {
      is: OfficeType.BRANCH,
      then: Yup.string().trim().required(requiredMsg).nullable(),
    }),
  taxId: Yup.string()
    .trim()
    .matches(TAX_ID, invalidTaxIdMsg)
    .required(requiredMsg),
  taxCountry: Yup.string().trim().required(requiredMsg),
  taxProvince: Yup.object().required(requiredMsg).nullable(),
  taxDistrict: Yup.object().required(requiredMsg).nullable(),
  taxSubdistrict: Yup.object().required(requiredMsg).nullable(),
  taxPostalCode: Yup.object().required(requiredMsg).nullable(),
  taxAddress: Yup.string().trim().required(requiredMsg),
  taxContactPerson: Yup.string().trim().required(requiredMsg),
  taxContactEmail: Yup.string()
    .trim()
    .matches(EMAIL_PATTERN, emailMsg)
    .required(requiredMsg),
  taxContactPhoneNumber: Yup.string()
    .trim()
    .matches(TH_PHONE_REGEX, invalidPhoneNumberMsg)
    .required(requiredMsg),
  billingCountry: Yup.string()
    .trim()
    .when(['billingOption'], {
      is: isNewBilling,
      then: Yup.string().trim().required(requiredMsg),
    }),
  billingProvince: Yup.mixed().when(['billingOption'], {
    is: isNewBilling,
    then: Yup.object().required(requiredMsg).nullable(),
  }),
  billingDistrict: Yup.mixed().when(['billingOption'], {
    is: isNewBilling,
    then: Yup.object().required(requiredMsg).nullable(),
  }),
  billingSubdistrict: Yup.mixed().when(['billingOption'], {
    is: isNewBilling,
    then: Yup.object().required(requiredMsg).nullable(),
  }),
  billingPostalCode: Yup.mixed().when(['billingOption'], {
    is: isNewBilling,
    then: Yup.object().required(requiredMsg).nullable(),
  }),
  billingAddress: Yup.string()
    .trim()
    .when(['billingOption'], {
      is: isNewBilling,
      then: Yup.string().trim().required(requiredMsg),
    }),
});
