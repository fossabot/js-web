import { HttpService } from '@nestjs/common';
import { ContactCorporate, ContactRetail } from './contact.entity';
import { FormType } from './FormType.enum';

export interface LeadContactResponse {
  ID: string;
  'Date Import': string;
  Status: string;
  Description: string;
}

type LeadContactCRMDto = {
  leadtype: FormType;
  leadid: string;
  companyindustry?: string;
  noofemployee?: string;
} & Partial<ContactRetail> &
  Partial<ContactCorporate>;

const isCorporateContact = (
  contact: ContactRetail | ContactCorporate,
): contact is ContactCorporate => {
  const corporate = contact as ContactCorporate;
  return (
    corporate.companyIndustry !== undefined &&
    corporate.NoOfEmployee !== undefined
  );
};

export const sendLeadContactToCRM = async (
  contact: ContactRetail | ContactCorporate,
  type: FormType,
  PATH: string | undefined,
  sig: string | undefined,
) => {
  const { id, ...data } = contact;
  const contactCRM: LeadContactCRMDto = {
    ...data,
    products: [''],
    leadtype: type,
    leadid: id,
  };

  if (isCorporateContact(contact)) {
    contactCRM.companyindustry = contact.companyIndustry;
    contactCRM.noofemployee = contact.NoOfEmployee;
  }

  const httpService = new HttpService();

  const res = await httpService
    .post<LeadContactResponse[]>(`${PATH}${sig}`, contactCRM)
    .toPromise();

  return res.data;
};
