import axios from 'axios';
import Head from 'next/head';
import Link from 'next/link';
import urljoin from 'url-join';
import { useFormik } from 'formik';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import Button from '../ui-kit/Button';
import Picture from '../ui-kit/Picture';
import InputSection from '../ui-kit/InputSection';
import CenterLayout from '../layouts/center.layout';
import useTranslation from '../i18n/useTranslation';
import { emailSchema } from '../signup/login.schema';
import API_PATHS from '../../src/constants/apiPaths';
import MinimalNavbar from '../ui-kit/headers/MinimalNavbar';
import { ArrowLeft } from '../ui-kit/icons';
import WEB_PATHS from '../constants/webPaths';
import { useRouter } from 'next/router';
import Script from 'next/script';
import config from '../config';
import { getReCaptchaToken } from '../utils/recaptcha';

const apiBaseUrl = process.env.AUTH_API_BASE_URL;

export function useForgotPasswordForm() {
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const emailRef = useRef(null);

  useEffect(() => {
    if (emailRef.current) {
      emailRef.current.scrollIntoView();
      emailRef.current.focus();
    }
  }, []);

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validateOnBlur: false,
    validationSchema: emailSchema,
    onSubmit: handleFormSubmit,
  });

  async function handleFormSubmit(payload: { email: string }) {
    setLoading(true);
    await callApiForgotPassword(payload);
    setLoading(false);
  }

  async function callApiForgotPassword(payload: { email: string }) {
    try {
      const recaptcha = await getReCaptchaToken('forgot_password');
      await axios.post(urljoin(apiBaseUrl, API_PATHS.FORGOT_PASSWORD), {
        ...payload,
        recaptcha,
      });
      setSuccess(true);
    } catch (error) {
      setErrorMessage(error.message);
      setSuccess(false);
    }
  }

  return {
    formik,
    isSuccess,
    loading,
    emailRef,
    errorMessage,
    handleFormSubmit,
    callApiForgotPassword,
  };
}

export default function ForgotPassword() {
  const router = useRouter();
  const { t } = useTranslation();
  const { formik, isSuccess, errorMessage, emailRef } = useForgotPasswordForm();

  const ErrorFeedback = () => (
    <div className="mt-4 rounded bg-maroon-100 p-4 text-maroon-600">
      {errorMessage}
    </div>
  );

  const head = useMemo(
    () => (
      <Head>
        <title>
          {t('headerText')} | {t('forgotPasswordPage.metaTitle')}
        </title>
      </Head>
    ),
    [],
  );

  return (
    <CenterLayout head={head} header={<MinimalNavbar />}>
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${config.RECAPTCHA_SITE_KEY}`}
      ></Script>
      <div className="mx-7 flex max-w-xs flex-col items-center justify-center text-center">
        {!isSuccess ? (
          <>
            <div className="mb-3 text-subtitle font-bold lg:text-title-desktop">
              {t('forgotPasswordPage.subtitle')}
            </div>
            <div className="mb-4 text-caption text-gray-500">
              {t('forgotPasswordPage.caption')}
            </div>
            {errorMessage?.length > 0 && <ErrorFeedback />}
            <form
              className="items- my-4 w-full place-self-start"
              onSubmit={formik.handleSubmit}
              autoComplete="off"
            >
              <InputSection
                name="email"
                label={t('emailAddress')}
                placeholder={t('forgotPasswordPage.emailPlaceholder')}
                onBlur={formik.handleBlur}
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && formik.errors.email}
                inputRef={emailRef}
              />
              <div className="mt-8">
                <Button
                  type="submit"
                  variant={formik.values.email ? 'primary' : 'secondary'}
                  size="medium"
                  disabled={!formik.values.email}
                >
                  {t('forgotPasswordPage.sendLink')}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="mb-12 w-28 text-center">
              <Picture
                sources={[
                  {
                    srcSet: '/assets/forgot-password-success.webp',
                    type: 'image/webp',
                  },
                ]}
                fallbackImage={{ src: '/assets/forgot-password-success.png' }}
              />
            </div>
            <div className="mb-4 text-subtitle font-bold lg:text-title-desktop">
              {t('forgotPasswordPage.successSubtitle')}
            </div>
            <div className="mb-8 text-caption text-gray-500">
              {t('forgotPasswordPage.successCaption')}
            </div>
            <Link href={{ pathname: WEB_PATHS.LOGIN, query: router.query }}>
              <a className="flex flex-row items-center text-caption font-semibold text-brand-primary">
                <ArrowLeft className="mr-3" />
                {t('forgotPasswordPage.backToLogin')}
              </a>
            </Link>
          </>
        )}
      </div>
    </CenterLayout>
  );
}
