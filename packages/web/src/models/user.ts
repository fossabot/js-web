import { Industry } from './industry';
import { OrganizationUser } from './organizationUser';
import { AgeRange, CompanySizeRange } from './range';

export class User {
  id!: string | null;
  username!: string | null;
  email?: string;
  isEmailConfirmed!: boolean;
  phoneNumber!: string | null;
  isPhoneNumberConfirmed!: boolean;
  isTwoFactorEnabled!: boolean;
  isLockedOut!: boolean;
  lockoutEndDateUTC!: string | null;
  accessFailedCount!: number;
  emailVerificationKey!: string | null;
  dob!: string | null;
  emailVerificationRequestDateUTC!: string | null;
  passwordResetKey!: string | null;
  passwordResetRequestDateUTC!: string | null;
  title!: UserTitle | null;
  firstName!: string | null;
  lastName!: string | null;
  fullName?: string | null;
  gender!: Gender | null;
  ageRange!: AgeRange | null;
  zipCode!: string | null;
  jobTitle!: string | null;
  department!: string | null;
  companyName!: string | null;
  industry!: Industry | null;
  companySizeRange!: CompanySizeRange | null;
  skillsToImprove!: string | null;
  isActivated: boolean;
  lineId!: string | null;
  lineIdVisible!: boolean;
  dobVisible!: boolean;
  profileImageKey: string | null;
  roles: string[];
  shortSummary?: string | null;
  bio?: string | null;
  experience?: string | null;
  organizationUser: OrganizationUser[];
}

export enum UserTitle {
  Mr = 'mr',
  Mrs = 'mrs',
  Ms = 'ms',
  Khun = 'khun',
}

export enum Gender {
  Male = 'male',
  Female = 'female',
  Other = 'other',
}
