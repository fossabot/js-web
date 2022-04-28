import { rest } from 'msw';
import * as Yup from 'yup';
import { AxiosResponse } from 'axios';
import { EMAIL_PATTERN } from '../src/constants/regex';

const apiBaseUrl = process.env.AUTH_API_BASE_URL;

export const handlers = [
  rest.post(`${apiBaseUrl}/v1/forgot-password`, async (req, res, ctx) => {
    const emailSchema = Yup.object({
      email: Yup.string()
        .matches(EMAIL_PATTERN, 'errors.invalidEmailAddress')
        .required('required'),
    });
    const { email } = req.body as any;

    try {
      await emailSchema.validate({ email });
    } catch (error) {
      return res(ctx.status(400), ctx.json<AxiosResponse>({ ...error }));
    }

    return res();
  }),

  rest.post(`${apiBaseUrl}/v1/reset-password`, async (req, res, ctx) => {
    const numberRegex = /[0-9]/;
    const upperCaseRegex = /[A-Z]/;
    const lowerCaseRegex = /[a-z]/;
    const specialCharRegex = /[!#$%&'()*+,-./:;<=>?@[\]^_{|}~]/;
    const resetPasswordSchema = Yup.object({
      password: Yup.string()
        .min(8)
        .matches(upperCaseRegex)
        .matches(lowerCaseRegex)
        .matches(numberRegex)
        .matches(specialCharRegex)
        .required('required'),
      token: Yup.string().required(),
    });
    const { password, token } = req.body as any;

    try {
      await resetPasswordSchema.validate({ password, token });
    } catch (error) {
      return res(ctx.status(400), ctx.json<AxiosResponse>({ ...error }));
    }

    return res();
  }),

  rest.post(
    `${apiBaseUrl}/v1/validate-password-token`,
    async (req, res, ctx) => {
      const tokenSchema = Yup.object({
        token: Yup.string().required(),
      });
      const { token } = req.body as any;

      try {
        await tokenSchema.validate({ token });
      } catch (error) {
        return res(ctx.status(400), ctx.json<AxiosResponse>({ ...error }));
      }

      return res(
        ctx.json<AxiosResponse>({
          data: { success: true },
          status: 200,
          statusText: '',
          headers: {},
          config: {},
        }),
      );
    },
  ),
];
