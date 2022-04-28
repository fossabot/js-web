import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Head from 'next/head';
import { useFormik } from 'formik';
import { login as authLogin } from '../app-state/auth';

import IllustrationLayout from '../layouts/illustration.layout';
import ERRORS from '../constants/error';
import signupSchema from './signup.schema';
import PasswordRules from './PasswordRules';
import InputSection from '../ui-kit/InputSection';
import useTranslation from '../i18n/useTranslation';
import NEXT_API_PATHS from '../constants/nextApiPaths';
import Button from '../ui-kit/Button';
import WEB_PATHS, { CORPORATE_WEB_PATHS } from '../constants/webPaths';
import { InputBehavior } from '../ui-kit/InputField';
import { useRouter } from 'next/router';
import { getReCaptchaToken } from '../utils/recaptcha';
import Script from 'next/script';
import config from '../config';

interface ISignup {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  leadformurl: string;
}

export default function Signup() {
  const router = useRouter();
  const { t } = useTranslation();
  const firstNameRef = useRef(null);
  const [error, setError] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);

  const focusInput = (ref: React.MutableRefObject<HTMLInputElement>) => {
    ref.current.scrollIntoView();
    ref.current.focus();
  };

  useEffect(() => {
    focusInput(firstNameRef);
  }, []);

  const formik = useFormik<ISignup>({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      leadformurl: router.pathname,
    },
    validateOnBlur: false,
    validationSchema: signupSchema,
    onSubmit: handleFormSubmit,
  });

  async function handleFormSubmit(values: ISignup) {
    try {
      setError('');
      setIsRequesting(true);
      const recaptcha = await getReCaptchaToken('signup_local');
      const response = await axios.post(NEXT_API_PATHS.SIGN_UP_LOCAL, {
        ...values,
        recaptcha,
      });
      const { accessToken, accessTokenExpiry, user } = response.data;

      await authLogin(
        {
          jwtToken: accessToken,
          jwtTokenExpiry: accessTokenExpiry,
          user,
        },
        false,
        (router.query.referer as string) ?? undefined,
      );
    } catch (error) {
      if (error && error.response && error.response.status === 400) {
        if (error.response.data.data) {
          setError(error.response.data.data?.error);
        } else {
          setError(error.response.data.error);
        }
      } else {
        setError(ERRORS.GENERIC_NETWORK_ERROR);
      }

      setIsRequesting(false);
    }
  }

  const head = useMemo(
    () => (
      <Head>
        <title>
          {t('headerText')} | {t('signupPage.metaTitle')}
        </title>
      </Head>
    ),
    [],
  );

  return (
    <IllustrationLayout head={head}>
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${config.RECAPTCHA_SITE_KEY}`}
      ></Script>
      <div className="mt-8 mb-8 lg:mb-10 lg:mt-4">
        <h4 className="mb-4 text-title-mobile font-bold lg:text-title-desktop">
          {t('signupPage.createAccount')}
        </h4>
      </div>
      <div>
        {error ? (
          <div className="my-12 bg-maroon-200 p-4 text-caption font-semibold text-maroon-600">
            {error}
          </div>
        ) : null}
        <form onSubmit={formik.handleSubmit} autoComplete="off">
          <div className="lg:mb-6 lg:flex lg:w-full lg:flex-row lg:items-baseline lg:justify-center">
            <InputSection
              formik={formik}
              inputRef={firstNameRef}
              label={t('firstName')}
              name="firstName"
              placeholder={t('signupPage.firstNamePlaceholder')}
              inputWrapperClassName="lg:mr-1 mb-6 lg:mb-0"
              value={formik.values.firstName}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              error={formik.touched.firstName && formik.errors.firstName}
            />
            <InputSection
              formik={formik}
              label={t('lastName')}
              name="lastName"
              placeholder={t('signupPage.lastNamePlaceholder')}
              inputWrapperClassName="lg:ml-1 mb-6 lg:mb-0"
              value={formik.values.lastName}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              error={formik.touched.lastName && formik.errors.lastName}
            />
          </div>
          <InputSection
            formik={formik}
            label={t('emailAddress')}
            name="email"
            placeholder={t('signinPage.emailPlaceholder')}
            inputWrapperClassName="mb-6"
            value={formik.values.email}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            error={formik.touched.email && formik.errors.email}
          />
          <div className="relative mb-6">
            <InputSection
              label={t('password')}
              name="password"
              type="password"
              hideErrorMessage
              behavior={InputBehavior.password}
              placeholder={t('signinPage.passwordPlaceholder')}
              inputWrapperClassName="mb-2"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.password}
              error={formik.touched.password && formik.errors.password}
            />
            {formik.touched.password && formik.errors.password && (
              <div className="relative z-10 lg:absolute lg:top-0 lg:right-full lg:mr-3 lg:mt-6">
                <PasswordRules
                  touched={formik.touched.password}
                  password={formik.values.password}
                />
              </div>
            )}
          </div>
          <InputSection
            label={t('signupPage.confirmPassword')}
            name="confirmPassword"
            type="password"
            behavior={InputBehavior.password}
            placeholder={t('signupPage.confirmPasswordPlaceholder')}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.confirmPassword}
            hideErrorMessage
            error={formik.touched.password && formik.errors.password}
          />
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <p className="pt-2 text-left text-footnote text-red-200">
              {t('signupPage.errors.passwordMismatch')}
            </p>
          )}
          <div className="submit-btn mt-8">
            <Button
              variant="primary"
              type="submit"
              size="medium"
              isLoading={isRequesting}
              disabled={isRequesting || !formik.isValid}
            >
              Sign up
            </Button>
          </div>
        </form>
        <div className="mt-4 text-center text-footnote">
          {t('signupPage.termsLine')}
          <Link href={CORPORATE_WEB_PATHS.TERMS_OF_USE}>
            <a className="mx-1 underline">
              {t('signupPage.termsAndConditions')}
            </a>
          </Link>
          {t('signupPage.and')}
          <Link href={CORPORATE_WEB_PATHS.PRIVACY_POLICY}>
            <a className="mx-1 underline">{t('signupPage.privacyPolicy')}</a>
          </Link>
        </div>
        <div className="mt-6 mb-10 text-caption font-bold">
          <span>{t('signupPage.haveAccount')}</span>
          <Link href={{ pathname: WEB_PATHS.LOGIN, query: router.query }}>
            <a className="ml-2 text-brand-primary">{t('signinPage.signIn')}</a>
          </Link>
        </div>
      </div>
    </IllustrationLayout>
  );
}
