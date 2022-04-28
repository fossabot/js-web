// https://oozou.slack.com/files/UPFJSHJJ2/F026VUJ2B7Y/align-seac-crm-api_spec-13052021-v9.pdf
// If there is a new version copy-paste to a new file and update

import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { defaultTo } from 'lodash';
import { Deprecated, IsCRMDate, IsEqual } from '../../utils/custom-validator';
import { EMAIL_PATTERN, TH_PHONE_REGEX } from '../../utils/constants';

export class CRMContactRetailPaidV9 {
  @IsString()
  @Length(0, 100)
  @Matches(EMAIL_PATTERN)
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(0, 50)
  firstname: string;

  @IsString()
  @IsNotEmpty()
  @Length(0, 50)
  lastname: string;

  /**
   * M = Male
   * F = Female
   */
  @IsOptional()
  @IsIn(['M', 'F'])
  @Length(0, 10)
  gender?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(0, 100)
  salutation?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(0, 100)
  companyname?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(0, 100)
  jobtitle?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Matches(/\d+/g)
  @Length(0, 15)
  phoneno?: string;

  /**
   * 1 = Phone
   * 2 = Email
   * 3 = Line@
   * 4 = Website Lead Box
   * 5 = Facebook Inbox
   * 6 = Chat Bot
   * 7 = Face-to-Face
   * 8 = Event
   * 9 = Referral
   * 10 = Social Media
   * 11 = Other
   */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsIn(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'])
  @Length(0, 10)
  utm_source?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(0, 100)
  utm_medium?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(0, 100)
  utm_campaign_name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(0, 100)
  channel_description?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsIn(['SEAC', 'YNURETAIL', 'CS'])
  @Length(0, 100)
  tracking?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(0, 100)
  cookieid?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(0, 2000)
  leadmessage?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(0, 2000)
  billingaddressth?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(0, 2000)
  billingaddressen?: string;

  @Deprecated()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  taxid?: string;

  @Deprecated()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(0, 150)
  invoicename?: string;

  @Deprecated()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(0, 2000)
  invoiceaddressth?: string;

  @Deprecated()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(0, 2000)
  invoiceaddressen?: string;

  @Deprecated()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(0, 50)
  invoicesubdistrictcode?: string;

  @Deprecated()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(0, 10)
  invoicepostcode?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(0, 100)
  coupon?: string;

  /**
   * 1 = Discount
   * 2 = Trial
   */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsIn(['1', '2'])
  @Length(0, 100)
  coupontype?: string;

  @IsNumber()
  amount: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  discount: number;

  @IsNumber()
  @IsEqual<CRMContactRetailPaidV9>(
    (self) => (self.amount * self.discount) / 100,
  )
  discountamount: number;

  @IsNumber()
  @Min(0)
  vat: number;

  @IsNumber()
  @IsEqual<CRMContactRetailPaidV9>(
    (self) => (self.amount - self.discountamount) * (self.vat / 100),
  )
  vatamount: number;

  @IsNumber()
  @IsEqual<CRMContactRetailPaidV9>(
    (self) => self.amount - self.discountamount + self.vatamount,
  )
  netamount: number;

  @IsString()
  @IsNotEmpty()
  @IsCRMDate()
  packagestartdate: string;

  @IsString()
  @IsNotEmpty()
  @IsCRMDate()
  packageenddate: string;

  @IsString()
  @IsNotEmpty()
  @Length(0, 100)
  reforderid: string;

  @IsString()
  @IsNotEmpty()
  @Length(0, 20)
  currency: string;

  @IsString()
  @IsNotEmpty()
  @IsEqual<CRMContactRetailPaidV9>((self) =>
    self.paymentstatus === '2' ? '-' : self.refpayment1,
  )
  @Length(0, 50)
  refpayment1: string;

  /**
   * Merchant ID
   */
  @IsString()
  @IsNotEmpty()
  @Length(0, 50)
  refpayment2: string;

  /**
   * 1 = Paymet Success
   * 2 = Payment Not Success
   */
  @IsString()
  @IsNotEmpty()
  @IsIn(['1', '2'])
  @Length(0, 50)
  paymentstatus: string;

  /**
   * 1 = Cash
   * 2 = Transfer
   * 3 = Cheque
   * 4 = Credit Card
   * 5 = QR promptpay
   */
  @IsString()
  @IsNotEmpty()
  @IsIn(['1', '2', '3', '4', '5'])
  @Length(0, 100)
  paymentchannel: string;

  @IsString()
  @IsNotEmpty()
  @Length(0, 50)
  channelresponsecode: string;

  @IsString()
  @IsNotEmpty()
  @Length(0, 250)
  channelresponsedesc: string;

  @IsString()
  @IsNotEmpty()
  @Length(0, 50)
  approvecode: string;

  @IsString()
  @IsNotEmpty()
  @IsCRMDate()
  transactiondatetime: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(0, 100)
  utm_term?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(0, 100)
  utm_content?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(0, 100)
  originalurl?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(0, 500)
  taggedurl?: string;

  @Deprecated()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  leadid?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsCRMDate()
  updatedatetime?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsCRMDate()
  senddatetime?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsCRMDate()
  registerdatetime?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(0, 100)
  stateid?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(0, 100)
  sessionid?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Matches(/S\d{5}/g)
  @Length(0, 100)
  campaignid?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(0, 100)
  campaignname?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(0, 100)
  promotiondetail?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  leadformurl?: string;

  @IsOptional()
  @IsBoolean()
  consent_mkt?: boolean;

  @IsString()
  @IsNotEmpty()
  @Length(0, 50)
  skucode: string;

  @IsString()
  @IsNotEmpty()
  @Length(0, 100)
  skuname: string;

  @IsBoolean()
  FullTaxRequest: boolean;

  /**
   * 1 = Individual
   * 2 = Organization
   */
  @ValidateIf((object: any) => object.FullTaxRequest)
  @IsString()
  @IsNotEmpty()
  @IsIn(['1', '2'])
  @Length(0, 10)
  FullTaxtype?: string;

  @ValidateIf((object: any) => object.FullTaxRequest)
  @IsString()
  @IsNotEmpty()
  @Length(0, 150)
  FullTaxName?: string;

  @ValidateIf((object: any) => object.FullTaxRequest)
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(0, 50)
  FullTaxHeadOfficeBranch?: string;

  @ValidateIf((object: any) => object.FullTaxRequest)
  @IsString()
  @IsNotEmpty()
  @Length(0, 50)
  FullTaxID?: string;

  /**
   * Tax address
   */
  @ValidateIf((object: any) => object.FullTaxRequest)
  @IsString()
  @IsNotEmpty()
  @Length(0, 250)
  FullTaxAddress1?: string;

  /**
   * Tax address subdistrict code
   */
  @ValidateIf((object: any) => object.FullTaxRequest)
  @IsString()
  @IsNotEmpty()
  @IsNumberString({ no_symbols: true }, { groups: ['TH'] })
  @Length(0, 100)
  FullTaxAddress2?: string;

  /**
   * Tax address district code
   */
  @ValidateIf((object: any) => object.FullTaxRequest)
  @IsString()
  @IsNotEmpty()
  @IsNumberString({ no_symbols: true }, { groups: ['TH'] })
  @Length(0, 100)
  FullTaxAddress3?: string;

  /**
   * Tax address province code
   */
  @ValidateIf((object: any) => object.FullTaxRequest)
  @IsString()
  @IsNotEmpty()
  @IsNumberString({ no_symbols: true }, { groups: ['TH'] })
  @Length(0, 100)
  FullTaxAddress4?: string;

  /**
   * Tax address country
   */
  @ValidateIf((object: any) => object.FullTaxRequest)
  @IsString()
  @IsNotEmpty()
  @Length(0, 100)
  FullTaxAddress5?: string;

  @ValidateIf((object: any) => object.FullTaxRequest)
  @IsString()
  @IsNotEmpty()
  @Length(0, 10)
  FullTaxPostcode?: string;

  @ValidateIf((object: any) => object.FullTaxRequest)
  @IsString()
  @IsNotEmpty()
  @Length(0, 150)
  FullTaxContactPerson?: string;

  @ValidateIf((object: any) => object.FullTaxRequest)
  @IsString()
  @IsNotEmpty()
  @Matches(TH_PHONE_REGEX)
  @Length(0, 15)
  FullTaxPhoneContact?: string;

  @ValidateIf((object: any) => object.FullTaxRequest)
  @IsString()
  @IsNotEmpty()
  @Length(0, 100)
  FullTaxEmailContact?: string;

  /**
   * Billing address
   */
  @ValidateIf((object: any) => object.FullTaxRequest)
  @IsString()
  @IsNotEmpty()
  @IsEqual<CRMContactRetailPaidV9>((self) =>
    defaultTo(self.FullTaxMailingAddress1, self.FullTaxAddress1),
  )
  @Length(0, 250)
  FullTaxMailingAddress1?: string;

  /**
   * Billing address subdistrict code
   */
  @ValidateIf((object: any) => object.FullTaxRequest)
  @IsString()
  @IsNotEmpty()
  @IsNumberString({ no_symbols: true }, { groups: ['TH'] })
  @IsEqual<CRMContactRetailPaidV9>((self) =>
    defaultTo(self.FullTaxMailingAddress2, self.FullTaxAddress2),
  )
  @Length(0, 100)
  FullTaxMailingAddress2?: string;

  /**
   * Billing address district code
   */
  @ValidateIf((object: any) => object.FullTaxRequest)
  @IsString()
  @IsNotEmpty()
  @IsNumberString({ no_symbols: true }, { groups: ['TH'] })
  @IsEqual<CRMContactRetailPaidV9>((self) =>
    defaultTo(self.FullTaxMailingAddress3, self.FullTaxAddress3),
  )
  @Length(0, 100)
  FullTaxMailingAddress3?: string;

  /**
   * Billing address province code
   */
  @ValidateIf((object: any) => object.FullTaxRequest)
  @IsString()
  @IsNotEmpty()
  @IsNumberString({ no_symbols: true }, { groups: ['TH'] })
  @IsEqual<CRMContactRetailPaidV9>((self) =>
    defaultTo(self.FullTaxMailingAddress4, self.FullTaxAddress4),
  )
  @Length(0, 100)
  FullTaxMailingAddress4?: string;

  /**
   * Billing address country
   */
  @ValidateIf((object: any) => object.FullTaxRequest)
  @IsString()
  @IsNotEmpty()
  @IsEqual<CRMContactRetailPaidV9>((self) =>
    defaultTo(self.FullTaxMailingAddress5, self.FullTaxAddress5),
  )
  @Length(0, 100)
  FullTaxMailingAddress5?: string;

  /**
   * Billing address postal code
   */
  @ValidateIf((object: any) => object.FullTaxRequest)
  @IsString()
  @IsNotEmpty()
  @IsEqual<CRMContactRetailPaidV9>((self) =>
    defaultTo(self.FullTaxMailingPostcode, self.FullTaxPostcode),
  )
  @Length(0, 10)
  FullTaxMailingPostcode?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(0, 100)
  username?: string;
}
