import * as Yup from 'yup';
import {
  numberRegex,
  upperCaseRegex,
  lowerCaseRegex,
  specialCharRegex,
} from '../utils/password';
import { EMAIL_PATTERN } from '../constants/regex';

export const passwordYup = {
  password: Yup.string()
    .min(8)
    .matches(upperCaseRegex)
    .matches(lowerCaseRegex)
    .matches(numberRegex)
    .matches(specialCharRegex)
    .required('required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('required'),
};

const schema = Yup.object({
  firstName: Yup.string().required('required'),
  lastName: Yup.string().required('required'),
  email: Yup.string()
    .matches(EMAIL_PATTERN, 'errors.invalidEmailAddress')
    .required('required'),
  ...passwordYup,
});

export default schema;
