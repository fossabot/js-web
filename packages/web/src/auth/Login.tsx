import axios, { AxiosError } from 'axios';
import cx from 'classnames';
import { useFormik } from 'formik';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Script from 'next/script';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  handleSamlSPSSORedirection,
  login as authLogin,
} from '../app-state/auth';
import config from '../config';
import API_PATHS from '../constants/apiPaths';
import ERRORS from '../constants/error';
import { ERROR_CODES, ERROR_CODES_MAP } from '../constants/errors';
import NEXT_API_PATHS from '../constants/nextApiPaths';
import { SAML_LOGIN_ROUTE } from '../constants/routes';
import WEB_PATHS from '../constants/webPaths';
import { authHttp } from '../http';
import useTranslation from '../i18n/useTranslation';
import IllustrationLayout from '../layouts/illustration.layout';
import { emailSchema, passwordSchema } from '../signup/login.schema';
import Button from '../ui-kit/Button';
import { ArrowLeft } from '../ui-kit/icons';
import { InputBehavior } from '../ui-kit/InputField';
import InputSection from '../ui-kit/InputSection';
import { useLmsRouteRedirectQuery } from '../ui-kit/useLmsRouteRedirectQuery';
import { getReCaptchaToken } from '../utils/recaptcha';

interface ILoginForm {
  email?: string;
  password?: string;
}

interface ILoginFormProps {
  email: string;
  password: string;
  loginState: LoginState;
  onSubmit: (values: {
    email: string;
    password: string;
  }) => void | Promise<any>;
  isEmailNotFound?: boolean;
}

const LoginForm: React.FunctionComponent<ILoginFormProps> = ({
  email,
  password,
  loginState,
  isEmailNotFound,
  onSubmit,
}) => {
  const router = useRouter();
  const { t } = useTranslation();
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const focusInput = (ref: React.MutableRefObject<HTMLInputElement>) => {
    ref.current.scrollIntoView();
    ref.current.focus();
  };

  const formik = useFormik({
    initialValues: {
      email: email || '',
      password: password || '',
    },
    validateOnBlur: false,
    validationSchema:
      loginState === LoginState.PASSWORD ? passwordSchema : emailSchema,
    onSubmit,
  });

  useEffect(() => {
    if (loginState === LoginState.EMAIL) {
      focusInput(emailRef);
    } else if (loginState === LoginState.PASSWORD) {
      focusInput(passwordRef);
    }
  }, [loginState]);

  const setTouchState = (item: ILoginForm, targetState: boolean) => {
    const touchState = {};
    Object.keys(item).forEach((k) => {
      touchState[k] = targetState;
    });

    return touchState;
  };

  const handleChange = (e) => {
    const touchState = setTouchState(formik.initialValues, false);
    formik.handleChange(e);
    formik.setTouched(touchState);
  };

  const handleBlur = (e) => {
    const touchState = setTouchState(formik.initialValues, true);
    formik.setTouched(touchState);
    formik.handleBlur(e);
  };

  return (
    <>
      <form onSubmit={formik.handleSubmit} autoComplete="off">
        <InputSection
          formik={formik}
          label={t('emailAddress')}
          name="email"
          placeholder={t('signinPage.emailPlaceholder')}
          inputWrapperClassName="mb-4"
          value={formik.values.email}
          onBlur={handleBlur}
          onChange={handleChange}
          error={formik.touched.email && formik.errors.email}
          disabled={loginState !== LoginState.EMAIL}
          inputRef={emailRef}
        />
        {isEmailNotFound && (
          <div className="text-footnote text-red-200">
            <Link href={{ pathname: WEB_PATHS.SIGN_UP, query: router.query }}>
              <a>{t('signinPage.errors.emailNotExists')}</a>
            </Link>
          </div>
        )}
        <InputSection
          label={t('password')}
          name="password"
          type="password"
          behavior={InputBehavior.password}
          placeholder={t('signinPage.passwordPlaceholder')}
          inputWrapperClassName={cx(
            'mb-3',
            loginState !== LoginState.PASSWORD && 'hidden',
          )}
          onBlur={handleBlur}
          onChange={handleChange}
          value={formik.values.password}
          error={formik.touched.password && formik.errors.password}
          inputRef={passwordRef}
        />
        <div
          className={cx(
            'text-right text-brand-primary',
            loginState !== LoginState.PASSWORD && 'hidden',
          )}
        >
          <Link
            href={{ pathname: WEB_PATHS.FORGOT_PASSWORD, query: router.query }}
          >
            <a className="text-caption underline">
              {t('signinPage.forgotPassword')}
            </a>
          </Link>
        </div>
        <div className="submit-btn mt-8 mb-5">
          <Button
            variant="primary"
            type="submit"
            size="medium"
            disabled={!formik.isValid}
          >
            {loginState === LoginState.EMAIL
              ? t('continue')
              : t('signinPage.signIn')}
          </Button>
        </div>
      </form>

      <div className="mt-5 mb-10 text-center text-caption font-bold">
        {loginState === LoginState.SSO_LOGIN ? (
          <>
            {process.env.NEXT_PUBLIC_HIDE_V2_FEATURE !== String('true') && (
              <>
                <span>{t('navbar.needHelp')}</span>
                <span className="ml-2 text-brand-primary">
                  <Link href={WEB_PATHS.HELP_CENTER}>
                    <a target="_blank" rel="noopener noreferrer">
                      {t('navbar.helpCenter')}
                    </a>
                  </Link>
                </span>
              </>
            )}
          </>
        ) : (
          <>
            <span>{t('signinPage.dontHaveAccount')}</span>
            <span className="ml-2 text-brand-primary">
              <Link href={{ pathname: WEB_PATHS.SIGN_UP, query: router.query }}>
                <a>{t('signinPage.createAccount')}</a>
              </Link>
            </span>
          </>
        )}
      </div>
    </>
  );
};

const ErrorContainer: React.FunctionComponent = ({ children }) => {
  return (
    <div className="my-12 bg-maroon-200 p-4 text-caption font-semibold text-maroon-600">
      {children}
    </div>
  );
};

const QueryErrors: React.FunctionComponent = () => {
  const { query, ERROR_CODE } = useLmsRouteRedirectQuery();

  return (
    <>
      {[
        ERROR_CODE.ERROR_OAUTH,
        ERROR_CODE.ERROR_SAML_LOGIN,
        ERROR_CODE.ERROR_SAML_SSO,
      ].includes(query.code) && (
        <ErrorContainer>{query.message}</ErrorContainer>
      )}
      {Object.keys(ERROR_CODES_MAP).includes(query.code) && (
        <ErrorContainer>{ERROR_CODES_MAP[query.code]}</ErrorContainer>
      )}
    </>
  );
};

enum LoginState {
  EMAIL = 'EMAIL',
  PASSWORD = 'PASSWORD',
  SSO_LOGIN = 'SSO_LOGIN',
}

export default function Login() {
  const { t } = useTranslation();
  const [form, setForm] = useState<ILoginForm>({});
  const [error, setError] = useState('');
  const [isEmailNotFound, setIsEmailNotFound] = useState(false);
  const [loginState, setLoginState] = useState(LoginState.EMAIL);
  const [hasSSOProvider, setHasSSOProvider] = useState(false);
  const router = useRouter();

  const errorCode = router.query.error as string;

  const onSubmit = async (payload: ILoginForm) => {
    if (loginState === LoginState.EMAIL) {
      handleValidateEmail(payload);
    } else {
      handleLoginClick(payload);
    }
  };

  /**
   * First step, validate email and get info about this account. If it's pass, showing password input and disable email input.
   * @param payload Form Values
   */
  const handleValidateEmail = async (payload: ILoginForm) => {
    try {
      setIsEmailNotFound(false);
      setError('');

      const response = await authHttp.post(API_PATHS.VALIDATE, {
        usernameOrEmail: payload.email,
      });

      setForm({
        ...form,
        email: payload.email,
      });

      if (!!response.data?.find((d) => d.provider === 'password')) {
        setLoginState(LoginState.PASSWORD);
        setHasSSOProvider(
          !!response.data?.find((d) => d.provider === 'samlSSO'),
        );
      } else {
        setLoginState(LoginState.SSO_LOGIN);
      }
    } catch (error) {
      const err = error as AxiosError;
      console.error(error);
      if (err.response && err.response.data.statusCode === 404) {
        setIsEmailNotFound(true);
      } else if (
        err.response &&
        err.response.data.code === ERROR_CODES.ERROR_USER_DEACTIVATED.code
      ) {
        setError(t('signinPage.errors.userIsDeactivated'));
      }
    }
  };

  /**
   * Second step, send email and password to login on server and get access token.
   * @param payload Form Values
   */
  const handleLoginClick = async (payload: ILoginForm) => {
    setForm({
      ...form,
      password: payload.password,
    });
    await login({ email: form.email, password: payload.password });
  };

  /**
   * Method that send email & password to verify on auth service.
   * @param payload Form Values
   * @returns
   */
  const login = async (payload: ILoginForm = {}) => {
    try {
      setError('');
      const recaptcha = await getReCaptchaToken('login');
      const response = await axios.post(NEXT_API_PATHS.LOGIN, {
        ...payload,
        recaptcha,
      });
      const { accessToken, accessTokenExpiry, user } = response.data;

      if ([SAML_LOGIN_ROUTE].includes(router.pathname) && router.query.TARGET) {
        handleSamlSPSSORedirection(accessToken, router.query.TARGET as string);
        return;
      } else if (router.query.referer) {
        authLogin(
          {
            jwtToken: accessToken,
            jwtTokenExpiry: accessTokenExpiry,
            user,
          },
          false,
          router.query.referer as string,
        );
        return;
      }
      authLogin({
        jwtToken: accessToken,
        jwtTokenExpiry: accessTokenExpiry,
        user,
      });
    } catch (error) {
      console.error(error);
      if (error && error.response && error.response.data) {
        setError(error.response.data?.data?.message);
      } else {
        setError(ERRORS.GENERIC_NETWORK_ERROR);
      }
    }
  };

  const handleGoBack = () => {
    setLoginState(LoginState.EMAIL);
    setHasSSOProvider(false);
  };

  const head = useMemo(
    () => (
      <Head>
        <title>
          {t('headerText')} | {t('login')}
        </title>
      </Head>
    ),
    [],
  );

  useEffect(() => {
    if (!errorCode) return;

    const foundError = ERROR_CODES[errorCode];
    if (foundError.code === ERROR_CODES.ERROR_USER_DEACTIVATED.code) {
      setError(t('signinPage.errors.userIsDeactivated'));
    } else {
      setError(foundError.message);
    }
  }, [errorCode]);

  return (
    <IllustrationLayout head={head}>
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${config.RECAPTCHA_SITE_KEY}`}
      ></Script>
      {loginState === LoginState.EMAIL ? (
        <h4 className="mb-8 text-title-mobile font-bold lg:text-title-desktop">
          {t('signinPage.welcome')}
        </h4>
      ) : (
        <div
          onClick={handleGoBack}
          className="mb-8 flex cursor-pointer items-center text-title-mobile font-bold lg:text-left lg:text-title-desktop"
        >
          <ArrowLeft className="mr-4 h-8 w-8" />
          <span>{t('signinPage.goBack')}</span>
        </div>
      )}
      <QueryErrors />
      {(loginState === LoginState.SSO_LOGIN || hasSSOProvider) && (
        <ErrorContainer>{t('signinPage.errors.useTeamSignIn')}</ErrorContainer>
      )}
      {error && <ErrorContainer>{error}</ErrorContainer>}
      <LoginForm
        email={form.email}
        password={form.password}
        loginState={loginState}
        onSubmit={onSubmit}
        isEmailNotFound={isEmailNotFound}
      />
    </IllustrationLayout>
  );
}
