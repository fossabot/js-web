import { CompanySizeRange } from '../models/range';
import { Gender, UserTitle } from '../models/user';
import { Industry } from '../models/industry';
import * as Yup from 'yup';
import { TH_PHONE_REGEX } from '../constants/regex';
import { addYears } from 'date-fns';

export interface ProfileFormValue {
  email: string;
  phoneNumber: string;
  title: UserTitle;
  gender: Gender;
  firstName: string;
  lastName: string;
  dob: Date;
  dobVisible: boolean;
  lineId: string;
  lineIdVisible: boolean;
  jobTitle: string;
  department: string;
  companyName: string;
  companySizeRange: CompanySizeRange;
  industry: Industry;
  shortSummary?: string | null;
  bio?: string | null;
  experience?: string | null;
}
const now = new Date();
export const profileFormSchema = Yup.object({
  phoneNumber: Yup.string()
    .trim()
    .matches(TH_PHONE_REGEX, 'profilePage.invalidPhoneNumber'),
  firstName: Yup.string().trim().required('profilePage.required'),
  lastName: Yup.string().trim().required('profilePage.required'),
  dob: Yup.date()
    .nullable(true)
    .min(addYears(now, -100), 'profilePage.past100YearNotAllowed')
    .max(now, 'profilePage.futureDateNotAllowed'),
  experience: Yup.string().nullable(true).optional(),
  bio: Yup.string().nullable(true).optional(),
  shortSummary: Yup.string()
    .nullable(true)
    .optional()
    .max(200, 'textAreaLengthError'),
});
