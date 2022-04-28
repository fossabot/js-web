import * as Yup from 'yup';
import { EMAIL_PATTERN } from '../constants/regex';

export enum Gender {
  Male = 'male',
  Female = 'female',
  Other = 'other',
}

export enum UserTitle {
  Mr = 'mr',
  Mrs = 'mrs',
  Ms = 'ms',
  Khun = 'khun',
}

const schema = Yup.object({
  dob: Yup.date().optional(),
  phoneNumber: Yup.string().optional(),
  role: Yup.string().required('required'),
  lastName: Yup.string().required('required'),
  firstName: Yup.string().required('required'),
  gender: Yup.string().required('required'),
  title: Yup.string().required('required'),
  organization: Yup.string().required('required'),
  jobTitle: Yup.string().optional(),
  department: Yup.string().optional(),
  companyName: Yup.string().optional(),
  companySize: Yup.string().optional(),
  industry: Yup.string().optional(),
  email: Yup.string()
    .matches(EMAIL_PATTERN, 'errors.invalidEmailAddress')
    .required('required'),
});

export default schema;
