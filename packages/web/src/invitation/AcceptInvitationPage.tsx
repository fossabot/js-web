import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import Head from 'next/head';
import { useFormik } from 'formik';
import { useRouter } from 'next/router';

import { centralHttp } from '../http';
import Button from '../ui-kit/Button';
import ERRORS from '../constants/error';
import WEB_PATHS from '../constants/webPaths';
import API_PATHS from '../constants/apiPaths';
import InputSection from '../ui-kit/InputSection';
import useTranslation from '../i18n/useTranslation';
import CenterLayout from '../layouts/center.layout';
import PasswordRules from '../signup/PasswordRules';
import { InputBehavior } from '../ui-kit/InputField';
import { login as authLogin } from '../app-state/auth';
import NEXT_API_PATHS from '../constants/nextApiPaths';
import MinimalNavbar from '../ui-kit/headers/MinimalNavbar';
import acceptInvitationSchema from './acceptInvitation.schema';
import Script from 'next/script';
import config from '../config';
import { getReCaptchaToken } from '../utils/recaptcha';

const AcceptInvitationPage = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const passwordRef = useRef(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [invitedUser, setInvitedUser] = useState(null);
  const [isPasswordFocus, setIsPasswordFocus] = useState(false);

  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validateOnBlur: false,
    validationSchema: acceptInvitationSchema,
    onSubmit: handleFormSubmit,
  });

  useEffect(() => {
    if (router.query && router.query.token) {
      centralHttp
        .post(
          API_PATHS.VALIDATE_INVITATION_TOKEN.replace(
            ':token',
            router.query.token as string,
          ),
        )
        .then((response) => {
          setInvitedUser(response.data);
          if (passwordRef.current) {
            passwordRef.current.scrollIntoView();
            passwordRef.current.focus();
          }
        })
        .catch((error) => {
          console.error(error);
          router.replace(WEB_PATHS.INDEX);
        });
    }
  }, []);

  async function handleFormSubmit(values) {
    try {
      setError('');
      setIsLoading(true);
      const recaptcha = await getReCaptchaToken('signup_invitation');
      const response = await axios.post(NEXT_API_PATHS.SIGN_UP_INVITATION, {
        ...values,
        token: router.query.token,
        setup: router.query.setup || false,
        recaptcha,
      });
      const { accessToken, accessTokenExpiry, user } = response.data;

      authLogin({
        jwtToken: accessToken,
        jwtTokenExpiry: accessTokenExpiry,
        user,
      });
    } catch (error) {
      setIsLoading(false);

      if (error && error.response && error.response.status === 400) {
        if (error.response.data.data) {
          setError(error.response.data.data?.error);
        } else {
          setError(error.response.data.error);
        }
      } else {
        setError(ERRORS.GENERIC_NETWORK_ERROR);
      }
    }
  }

  function togglePasswordFocus(val: boolean) {
    setIsPasswordFocus(val);
  }

  const ErrorFeedback = () => (
    <div className="mt-4 rounded bg-maroon-100 p-4 text-maroon-600">
      {error}
    </div>
  );

  const head = useMemo(
    () => (
      <Head>
        <title>
          {t('headerText')} | {t('acceptInvitationPage.metaTitle')}
        </title>
      </Head>
    ),
    [],
  );

  if (!invitedUser) {
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
            {t('acceptInvitationPage.subtitle')}
          </div>

          {error.length > 0 && <ErrorFeedback />}
          <form
            className="items- my-4 w-full place-self-start lg:my-5"
            onSubmit={formik.handleSubmit}
            autoComplete="off"
          >
            <InputSection
              name="email"
              placeholder="Email"
              label={t('emailAddress')}
              inputWrapperClassName="mb-2"
              value={invitedUser?.email}
              disabled
            />
            <div className="relative mb-2">
              <InputSection
                name="password"
                type="password"
                inputRef={passwordRef}
                behavior={InputBehavior.password}
                onFocus={() => togglePasswordFocus(true)}
                label={t('acceptInvitationPage.passwordPlaceholder')}
                placeholder={t('acceptInvitationPage.passwordPlaceholder')}
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
                className={`relative right-0 top-0 z-50 my-2 mr-0 lg:absolute lg:right-full lg:-top-1/2 lg:mr-5 lg:my-0${
                  isPasswordFocus ? '' : ' hidden'
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
              label={t('acceptInvitationPage.confirmPasswordPlaceholder')}
              placeholder={t('acceptInvitationPage.confirmPasswordPlaceholder')}
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
                isLoading={isLoading}
                disabled={
                  !(formik.values.password && formik.values.confirmPassword) ||
                  isLoading
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
};

export default AcceptInvitationPage;
