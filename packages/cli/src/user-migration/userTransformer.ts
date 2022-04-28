import { UserTitle } from '@seaccentral/core/dist/user/userTitle.enum';
import { Industry } from '@seaccentral/core/dist/user/Industry.entity';
import { find, padStart } from 'lodash';
import { Gender } from '@seaccentral/core/dist/user/Gender.enum';
import { TR01_User } from '../instancy/TR001_User';

export function email(instancyUser: TR01_User, deidentify = false) {
  const { email: Email, user_id: UserID } = instancyUser;

  if (deidentify) {
    return `${UserID}.instancy@yopmail.com`;
  }

  return Email.replace(/\s+/g, '')
    .replace(/,/g, '')
    .replace(/\?/g, '')
    .replace(/\.$/g, '')
    .toLowerCase();
}

export function prefix(instancyUser: TR01_User) {
  const { prefix: Prefix } = instancyUser;
  switch (Prefix) {
    case 'Mr.':
      return UserTitle.Mr;
    case 'Ms.':
      return UserTitle.Ms;
    case 'Mrs.':
      return UserTitle.Mrs;
    case 'Khun':
      return UserTitle.Khun;
    default:
      return null;
  }
}

export function sanitizePhoneNumber(value: string) {
  return value
    .replace(/\s+/g, '')
    .replace(/\(\+66\)/g, '0')
    .replace(/\(\++\d+\)/g, '')
    .replace(/\(/g, '')
    .replace(/\)/g, '')
    .replace(/-/g, '');
}

export function phoneNumber(instancyUser: TR01_User, deidentify = false) {
  const {
    phone_number: PhoneNumber,
    mobile: Mobile,
    user_id: UserID,
  } = instancyUser;

  if (deidentify) {
    return `08${padStart(UserID.toString(), 8, '0')}`;
  }

  const TH_MOBILE_PHONE_REGEX = /^(08|09|06)([0-9]{8})$/;
  const phoneno =
    PhoneNumber === '-' || PhoneNumber === null ? Mobile : PhoneNumber;

  if (!phoneno) {
    return null;
  }

  const [sanitizedPhoneno] = sanitizePhoneNumber(phoneno).split(',');
  const output = TH_MOBILE_PHONE_REGEX.test(sanitizedPhoneno)
    ? sanitizedPhoneno
    : null;

  return output;
}

export function industry(instancyUser: TR01_User, industries: Industry[]) {
  const { work_industry: WhichIndustryUWorkIn } = instancyUser;
  if (!WhichIndustryUWorkIn) {
    return undefined;
  }

  const others = find(industries, { nameEn: 'Others' });
  const result = find(industries, (ind) =>
    ind.nameEn.includes(WhichIndustryUWorkIn),
  );
  if (!result) {
    return others;
  }

  return result;
}

export function gender(instancyUser: TR01_User) {
  switch (instancyUser.gender) {
    case 'Male':
      return Gender.Male;
    case 'Female':
      return Gender.Female;
    default:
      return null;
  }
}

export function isActive(instancyUser: TR01_User) {
  switch (instancyUser.user_status) {
    case 'Active':
      return true;
    case 'Deactive':
      return false;
    default:
      return true;
  }
}
