import axios from 'axios';
import get from 'lodash/get';
import Head from 'next/head';
import urljoin from 'url-join';
import { useFormik } from 'formik';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import Button from '../ui-kit/Button';
import API_PATHS from '../constants/apiPaths';
import WEB_PATHS from '../constants/webPaths';
import passwordSchema from './password.schema';
import { getStrength } from '../utils/password';
import InputSection from '../ui-kit/InputSection';
import PasswordRules from '../signup/PasswordRules';
import CenterLayout from '../layouts/center.layout';
import useTranslation from '../i18n/useTranslation';
import { InputBehavior } from '../ui-kit/InputField';
import MinimalNavbar from '../ui-kit/headers/MinimalNavbar';
import Script from 'next/script';
import config from '../config';
import { getReCaptchaToken } from '../utils/recaptcha';

const apiBaseUrl = process.env.AUTH_API_BASE_URL;

interface IResetPassword {
  password: string;
  confirmPassword: string;
}

export function useResetPasswordForm(token: string) {
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPasswordFocus, setIsPasswordFocus] = useState(false);
  const router = useRouter();
  const passwordRef = useRef(null);

  useEffect(() => {
    if (passwordRef.current) {
      passwordRef.current.scrollIntoView();
      passwordRef.current.focus();
    }
  }, []);

  const formik = useFormik<IResetPassword>({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validateOnBlur: false,
    validationSchema: passwordSchema,
    onSubmit: _handleFormSubmit,
  });

  function getPasswordStrength() {
    return getStrength(formik.values.password);
  }

  async function _handleFormSubmit(values: {
    password: string;
    confirmPassword: string;
  }) {
    const { password } = values;
    await _resetPassword({ password, token });
  }

  async function _resetPassword(payload: { password: string; token: string }) {
    setLoading(true);
    try {
      const recaptcha = await getReCaptchaToken('reset_password');
      await axios.post(urljoin(apiBaseUrl, API_PATHS.RESET_PASSWORD), {
        ...payload,
        recaptcha,
      });

      return router.replace(WEB_PATHS.LOGIN);
    } catch (error) {
      setErrorMessage(get(error, 'response.data.message', error.message));
    }
    setLoading(false);
  }

  function togglePasswordFocus(val: boolean) {
    setIsPasswordFocus(val);
  }

  return {
    formik,
    getPasswordStrength,
    _handleFormSubmit,
    _resetPassword,
    errorMessage,
    togglePasswordFocus,
    isPasswordFocus,
    loading,
    passwordRef,
  };
}

export function useTokenValidation() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  async function validateToken(token: string) {
    try {
      await axios.post(urljoin(apiBaseUrl, API_PATHS.VALIDATE_PASSWORD_TOKEN), {
        token,
      });

      setLoading(false);
    } catch (error) {
      return router.replace(WEB_PATHS.LOGIN);
    }
  }

  return { validateToken, loading };
}

export default function ResetPassword() {
  const router = useRouter();
  const {
    query: { token },
  } = router;
  const {
    formik,
    errorMessage,
    togglePasswordFocus,
    isPasswordFocus,
    passwordRef,
  } = useResetPasswordForm(token as string);
  const { validateToken, loading } = useTokenValidation();
  const { t } = useTranslation();

  const ErrorFeedback = () => (
    <div className="mt-4 rounded bg-maroon-100 p-4 text-maroon-600">
      {errorMessage}
    </div>
  );

  const head = useMemo(
    () => (
      <Head>
        <title>
          {t('headerText')} | {t('resetPasswordPage.metaTitle')}
        </title>
      </Head>
    ),
    [],
  );

  useEffect(() => {
    async function asyncValidateToken() {
      await validateToken(token as string);
    }

    asyncValidateToken();
  }, []);

  if (loading) {
    return null;
  }

  return (
    <CenterLayout head={head} header={<MinimalNavbar />}>
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${config.RECAPTCHA_SITE_KEY}`}
      ></Script>
      <div className="mx-7 flex w-full max-w-md flex-col items-center justify-center text-center">
        <>
          <div className="mb-4 text-subtitle font-bold lg:mb-5 lg:text-title-desktop">
            {t('resetPasswordPage.subtitle')}
          </div>

          {errorMessage.length > 0 && <ErrorFeedback />}
          <form
            className="items- my-4 w-full place-self-start lg:my-5"
            onSubmit={formik.handleSubmit}
            autoComplete="off"
          >
            <div className="relative mb-2">
              <InputSection
                name="password"
                type="password"
                inputRef={passwordRef}
                behavior={InputBehavior.password}
                onFocus={() => togglePasswordFocus(true)}
                label={t('resetPasswordPage.passwordPlaceholder')}
                placeholder={t('resetPasswordPage.passwordPlaceholder')}
                onBlur={(e) => {
                  togglePasswordFocus(false);
                  formik.handleBlur(e);
                }}
                onChange={formik.handleChange}
                value={formik.values.password}
                hideErrorMessage
                error={formik.touched.password && formik.errors.password}
              />
              <div
                className={`relative right-0 top-0 z-10 my-2 mr-0 lg:absolute lg:right-full lg:mr-5 lg:mt-6${
                  isPasswordFocus || formik.errors.password ? '' : ' hidden'
                }`}
              >
                <PasswordRules
                  touched={formik.touched.password}
                  password={formik.values.password}
                />
              </div>
            </div>
            <InputSection
              type="password"
              name="confirmPassword"
              behavior={InputBehavior.password}
              label={t('resetPasswordPage.confirmPasswordPlaceholder')}
              placeholder={t('resetPasswordPage.confirmPasswordPlaceholder')}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.confirmPassword}
              error={
                formik.touched.confirmPassword && formik.errors.confirmPassword
              }
            />
            <div className="mt-5">
              <Button
                type="submit"
                variant={
                  formik.values.password && formik.values.confirmPassword
                    ? 'primary'
                    : 'secondary'
                }
                size="medium"
                disabled={
                  !(formik.values.password && formik.values.confirmPassword)
                }
              >
                {t('submit')}
              </Button>
            </div>
          </form>
        </>
      </div>
    </CenterLayout>
  );
}
