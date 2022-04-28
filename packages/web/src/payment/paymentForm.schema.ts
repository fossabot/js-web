import * as Yup from 'yup';
import { TH_PHONE_REGEX, TAX_ID, EMAIL_PATTERN } from '../constants/regex';
import { District } from '../models/district';
import { Province } from '../models/province';
import { Subdistrict } from '../models/subdistrict';

export enum PaymentOption {
  CREDIT_CARD = 'CC',
  QR_CODE = 'THQR',
  INSTALLMENT_PAYMENT = 'IPP',
}

export enum BillingAddressOption {
  SAME_AS_INVOICE = 'SAME_AS_INVOICE',
  ADD_NEW = 'ADD_NEW',
}

export enum TaxType {
  INDIVIDUAL = 'INDIVIDUAL',
  ORGANIZATION = 'ORGANIZATION',
}

export enum OfficeType {
  HEAD_OFFICE = 'HEAD_OFFICE',
  BRANCH = 'BRANCH',
}

export interface PaymentForm {
  paymentOption: PaymentOption;
  billingOption: BillingAddressOption;
  billingCountry: string;
  billingProvince: Province;
  billingDistrict: District;
  billingSubdistrict: Subdistrict;
  billingPostalCode: Subdistrict;
  billingAddress: string;
  issueTaxInvoice: boolean;
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
  addressOption: { label: string; value: any }[];
  couponCode: string;
}

const isNewBilling = (
  issueTaxInvoice: boolean,
  billingOption: BillingAddressOption,
) => issueTaxInvoice && billingOption === BillingAddressOption.ADD_NEW;
const requiredMsg = 'Required';
const emailMsg = 'Must be a valid email';
const invalidPhoneNumberMsg = 'Please enter a valid Thai phone number';
const invalidTaxIdMsg = 'Plese enter a valid tax ID';

export default Yup.object().shape({
  issueTaxInvoice: Yup.boolean().required(requiredMsg),
  paymentOption: Yup.string()
    .trim()
    .oneOf<PaymentOption>(Object.values(PaymentOption))
    .required(requiredMsg),
  billingOption: Yup.string()
    .trim()
    .oneOf<BillingAddressOption>(Object.values(BillingAddressOption))
    .when('issueTaxInvoice', {
      is: true,
      then: Yup.string().trim().required(requiredMsg),
    }),
  taxType: Yup.string()
    .trim()
    .oneOf<TaxType>(Object.values(TaxType))
    .when('issueTaxInvoice', {
      is: true,
      then: Yup.string().trim().required(requiredMsg),
    }),
  taxEntityName: Yup.string()
    .trim()
    .when('issueTaxInvoice', {
      is: true,
      then: Yup.string().trim().required(requiredMsg),
    }),
  officeType: Yup.string()
    .trim()
    .oneOf<OfficeType>(Object.values(OfficeType))
    .when('issueTaxInvoice', {
      is: true,
      then: Yup.string().trim().required(requiredMsg),
    }),
  branch: Yup.string()
    .trim()
    .when('officeType', {
      is: OfficeType.BRANCH,
      then: Yup.string().trim().required(requiredMsg),
    }),
  taxId: Yup.string()
    .trim()
    .when('issueTaxInvoice', {
      is: true,
      then: Yup.string()
        .trim()
        .matches(TAX_ID, invalidTaxIdMsg)
        .required(requiredMsg),
    }),
  taxCountry: Yup.string()
    .trim()
    .when('issueTaxInvoice', {
      is: true,
      then: Yup.string().trim().required(requiredMsg),
    }),
  taxProvince: Yup.mixed().when('issueTaxInvoice', {
    is: true,
    then: Yup.object().required(requiredMsg).nullable(),
  }),
  taxDistrict: Yup.mixed().when('issueTaxInvoice', {
    is: true,
    then: Yup.object().required(requiredMsg).nullable(),
  }),
  taxSubdistrict: Yup.mixed().when('issueTaxInvoice', {
    is: true,
    then: Yup.object().required(requiredMsg).nullable(),
  }),
  taxPostalCode: Yup.mixed().when('issueTaxInvoice', {
    is: true,
    then: Yup.object().required(requiredMsg).nullable(),
  }),
  taxAddress: Yup.string()
    .trim()
    .when('issueTaxInvoice', {
      is: true,
      then: Yup.string().trim().required(requiredMsg),
    }),

  taxContactPerson: Yup.string()
    .trim()
    .when(['issueTaxInvoice'], {
      is: true,
      then: Yup.string().trim().required(requiredMsg),
    }),
  taxContactEmail: Yup.string()
    .trim()
    .when(['issueTaxInvoice'], {
      is: true,
      then: Yup.string()
        .trim()
        .matches(EMAIL_PATTERN, emailMsg)
        .required(requiredMsg),
    }),
  taxContactPhoneNumber: Yup.string()
    .trim()
    .when(['issueTaxInvoice'], {
      is: true,
      then: Yup.string()
        .trim()
        .matches(TH_PHONE_REGEX, invalidPhoneNumberMsg)
        .required(requiredMsg),
    }),
  billingCountry: Yup.string()
    .trim()
    .when(['issueTaxInvoice', 'billingOption'], {
      is: isNewBilling,
      then: Yup.string().trim().required(requiredMsg),
    }),
  billingProvince: Yup.mixed().when(['issueTaxInvoice', 'billingOption'], {
    is: isNewBilling,
    then: Yup.object().required(requiredMsg).nullable(),
  }),
  billingDistrict: Yup.mixed().when(['issueTaxInvoice', 'billingOption'], {
    is: isNewBilling,
    then: Yup.object().required(requiredMsg).nullable(),
  }),
  billingSubdistrict: Yup.mixed().when(['issueTaxInvoice', 'billingOption'], {
    is: isNewBilling,
    then: Yup.object().required(requiredMsg).nullable(),
  }),
  billingPostalCode: Yup.mixed().when(['issueTaxInvoice', 'billingOption'], {
    is: isNewBilling,
    then: Yup.object().required(requiredMsg).nullable(),
  }),
  billingAddress: Yup.string()
    .trim()
    .when(['issueTaxInvoice', 'billingOption'], {
      is: isNewBilling,
      then: Yup.string().trim().required(requiredMsg),
    }),
});
