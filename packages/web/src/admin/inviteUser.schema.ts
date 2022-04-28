import * as Yup from 'yup';
import { EMAIL_PATTERN } from '../constants/regex';

const schema = Yup.object({
  role: Yup.string().required('required'),
  lastName: Yup.string().required('required'),
  firstName: Yup.string().required('required'),
  organization: Yup.string().required('required'),
  email: Yup.string()
    .matches(EMAIL_PATTERN, 'errors.invalidEmailAddress')
    .required('required'),
});

export default schema;
