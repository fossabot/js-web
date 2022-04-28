import * as Yup from 'yup';

const schema = Yup.object({
  password: Yup.string()
    .min(8)
    .matches(/[A-Z]/)
    .matches(/[a-z]/)
    .matches(/[0-9]/)
    .matches(/[!#$%&'()*+,-./:;<=>?@[\]^_{|}~]/)
    .required('Required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Required'),
});

export default schema;
