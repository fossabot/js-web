import * as Yup from 'yup';
import { EMAIL_PATTERN } from '../constants/regex';

export const loginSchema = Yup.object({
  email: Yup.string()
    .matches(EMAIL_PATTERN, 'errors.invalidEmailAddress')
    .required('required'),
  password: Yup.string()
    .min(8)
    .matches(/[A-Z]/)
    .matches(/[a-z]/)
    .matches(/[0-9]/)
    .matches(/[!#$%&'()*+,-./:;<=>?@[\]^_{|}~]/)
    .required('required'),
});

// Keep two schema below for sign up page.
export const emailSchema = Yup.object({
  email: Yup.string()
    .matches(EMAIL_PATTERN, 'errors.invalidEmailAddress')
    .required('required'),
});

export const passwordSchema = Yup.object({
  password: Yup.string()
    .min(8)
    .matches(/[A-Z]/)
    .matches(/[a-z]/)
    .matches(/[0-9]/)
    .matches(/[!#$%&'()*+,-./:;<=>?@[\]^_{|}~]/)
    .required('required'),
});
