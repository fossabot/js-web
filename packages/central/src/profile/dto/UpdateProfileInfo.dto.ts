import { UserTitle } from '@seaccentral/core/dist/user/userTitle.enum';
import { Gender } from '@seaccentral/core/dist/user/Gender.enum';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { IsNullable } from '@seaccentral/core/dist/utils/custom-validator';
import { TH_PHONE_REGEX } from '@seaccentral/core/dist/utils/constants';

export class UpdateProfileInfoDto {
  @Matches(TH_PHONE_REGEX)
  @IsNullable()
  @IsString()
  phoneNumber: string | null;

  @IsNullable()
  @IsEnum(UserTitle)
  title: UserTitle | null;

  @IsNullable()
  @IsEnum(Gender)
  gender: Gender | null;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsNullable()
  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : null))
  dob: Date | null;

  @IsBoolean()
  dobVisible: boolean;

  @IsNullable()
  @IsString()
  lineId: string | null;

  @IsBoolean()
  lineIdVisible: boolean;

  @IsNullable()
  @IsString()
  jobTitle: string | null;

  @IsNullable()
  @IsString()
  department: string | null;

  @IsNullable()
  @IsString()
  companyName: string | null;

  @IsNullable()
  @IsString()
  companySizeRange: string | null;

  @IsNullable()
  @IsString()
  industry: string | null;

  @IsNullable()
  @IsString()
  shortSummary: string | null;

  @IsNullable()
  @IsString()
  bio: string | null;

  @IsNullable()
  @IsString()
  experience: string | null;
}
