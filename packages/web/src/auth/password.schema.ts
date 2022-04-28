import * as Yup from 'yup';
import { passwordYup } from '../signup/signup.schema';

const schema = Yup.object({
  ...passwordYup,
});

export default schema;
