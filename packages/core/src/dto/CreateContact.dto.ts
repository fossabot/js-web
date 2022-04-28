// eslint-disable-next-line max-classes-per-file
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { EMAIL_PATTERN, TH_PHONE_REGEX } from '../utils/constants';

// CRM spec documentation V9

export class CreateContactDto {
  @Matches(EMAIL_PATTERN)
  @Length(0, 100)
  @ApiProperty()
  email: string;

  @IsString()
  @ApiProperty()
  @Length(0, 50)
  firstname: string;

  @IsString()
  @ApiProperty()
  @Length(0, 50)
  lastname: string;

  @IsOptional()
  @IsIn(['M', 'F'])
  @ApiPropertyOptional()
  gender?: string;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  @ApiPropertyOptional()
  salutation?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  @Length(0, 100)
  companyname?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  @Length(0, 100)
  jobtitle?: string;

  @IsNumberString()
  @ApiProperty()
  @Matches(TH_PHONE_REGEX)
  @Length(0, 15)
  phoneno: string;

  @IsOptional()
  @IsArray()
  @ApiPropertyOptional()
  products?: string[] = [''];

  @IsOptional()
  @IsNumberString()
  @Length(0, 10)
  @ApiPropertyOptional()
  utm_source?: string;

  @IsOptional()
  @Length(0, 100)
  @IsString()
  @ApiPropertyOptional()
  utm_medium?: string;

  @IsOptional()
  @Length(0, 100)
  @IsString()
  @ApiPropertyOptional()
  utm_campaign_name?: string;

  @IsOptional()
  @Length(0, 100)
  @IsString()
  @ApiPropertyOptional()
  channel_description?: string;

  @IsOptional()
  @Length(0, 100)
  @IsString()
  @ApiPropertyOptional()
  tracking?: string;

  @IsOptional()
  @Length(0, 100)
  @IsString()
  @ApiPropertyOptional()
  cookieid?: string;

  @IsOptional()
  @Length(0, 2000)
  @IsString()
  @ApiPropertyOptional()
  leadmessage?: string;

  @IsOptional()
  @Length(0, 100)
  @IsString()
  @ApiPropertyOptional()
  leadid?: string;

  @IsOptional()
  @Length(0, 100)
  @IsString()
  @ApiPropertyOptional()
  utm_term?: string;

  @IsOptional()
  @Length(0, 100)
  @IsString()
  @ApiPropertyOptional()
  utm_content?: string;

  @IsOptional()
  @Length(0, 100)
  @IsString()
  @ApiPropertyOptional()
  originalurl?: string;

  @IsOptional()
  @Length(0, 500)
  @IsString()
  @ApiPropertyOptional()
  taggedurl?: string;

  @IsOptional()
  @Length(0, 100)
  @IsString()
  @ApiPropertyOptional()
  stateid?: string;

  @IsOptional()
  @Length(0, 100)
  @IsString()
  @ApiPropertyOptional()
  sessionid?: string;

  @IsOptional()
  @Length(0, 100)
  @IsString()
  @ApiPropertyOptional()
  campaginid?: string;

  @IsOptional()
  @Length(0, 100)
  @IsString()
  @ApiPropertyOptional()
  campaginname?: string;

  @IsOptional()
  @Length(0, 100)
  @IsString()
  @ApiPropertyOptional()
  promotiondetail?: string;

  @IsOptional()
  @Length(0, 100)
  @IsString()
  @ApiProperty()
  leadformurl: string;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional()
  consent_mkt?: boolean;
}

export class CreateContactRetailDto extends CreateContactDto {
  @IsOptional()
  @Length(0, 20)
  @IsString()
  @ApiPropertyOptional()
  membertype?: 'Freemium' | 'Premium';

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional()
  signupmember?: boolean;
}

export class CreateContactCorporateDto extends CreateContactDto {
  @IsString()
  @Length(0, 250)
  @ApiProperty()
  companyIndustry: string;

  @IsString()
  @Length(0, 10)
  @ApiProperty()
  NoOfEmployee: string;

  @IsOptional()
  @IsNumberString()
  @Length(0, 50)
  @ApiPropertyOptional()
  telephone1?: string;

  @IsOptional()
  @Length(0, 50)
  @IsNumberString()
  @ApiPropertyOptional()
  fax?: string;

  @Matches(EMAIL_PATTERN)
  @IsOptional()
  @Length(0, 100)
  @ApiPropertyOptional()
  emailcompany?: string;
}

// TODO: Still on V3 spec
export class CreateContactTrialDto extends CreateContactDto {
  @IsOptional()
  @ApiProperty({ required: false })
  skucode?: string;

  @IsOptional()
  @ApiProperty({ required: false })
  skuname?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ required: false })
  packagestartdate?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ required: false })
  packageenddate?: string;

  @IsOptional()
  @ApiProperty({ required: false })
  coupon?: string;

  @IsOptional()
  @ApiProperty({ required: false })
  coupontype?: string;

  @IsOptional()
  @ApiProperty({ required: false })
  billingaddressth?: string;

  @IsOptional()
  @ApiProperty({ required: false })
  billingaddressen?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @ApiProperty({ required: false })
  billingsubdistrict?: number;
}
