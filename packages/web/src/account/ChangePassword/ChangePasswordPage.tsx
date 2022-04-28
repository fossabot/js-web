import { FormikHelpers, useFormik } from 'formik';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { useAuthInfo } from '../../app-state/useAuthInfo';
import API_PATHS from '../../constants/apiPaths';
import { ERROR_CODES } from '../../constants/errors';
import { authHttp } from '../../http';
import useTranslation from '../../i18n/useTranslation';
import Layout from '../../layouts/main.layout';
import PasswordRules from '../../signup/PasswordRules';
import { passwordYup } from '../../signup/signup.schema';
import Button from '../../ui-kit/Button';
import {
  DEFAULT_FADE_MESSAGE_TIMEOUT,
  FadeMessage,
  IFadeMessage,
} from '../../ui-kit/FadeMessage';
import { Warning } from '../../ui-kit/icons';
import { InputBehavior } from '../../ui-kit/InputField';
import InputSection from '../../ui-kit/InputSection';
import UserSidebar from '../../ui-kit/sidebars/UserSidebar';
import { captureError } from '../../utils/error-routing';

const changePasswordSchema = Yup.object({
  currentPassword: Yup.string().required('Required'),
  ...passwordYup,
});

interface IChangePassword {
  currentPassword: string;
  password: string;
  confirmPassword: string;
}

export const ChangePasswordPage = () => {
  const { context } = useAuthInfo();
  const { t } = useTranslation();

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [changePasswordMessage, setChangePasswordMessage] =
    useState<{ type: IFadeMessage['type']; title: string } | null>(null);

  const [hasChangeablePassword, setHasChangeablePassword] =
    useState<boolean | null>(null);

  useEffect(() => {
    setHasChangeablePassword(null);
    authHttp
      .post(API_PATHS.VALIDATE, {
        usernameOrEmail: context.token.user.email,
      })
      .then((res) => {
        if (!!res.data?.find((d) => d.provider === 'password')) {
          setHasChangeablePassword(true);
        } else {
          setHasChangeablePassword(false);
        }
      })
      .catch(captureError);
  }, [context.token.user.email]);

  const handleFormSubmit = async (
    values: IChangePassword,
    helpers: FormikHelpers<IChangePassword>,
  ) => {
    try {
      setIsChangingPassword(true);
      await authHttp.post(API_PATHS.CHANGE_PASSWORD, {
        currentPassword: values.currentPassword,
        newPassword: values.password,
      });
      setChangePasswordMessage({
        type: 'success',
        title: t('changePasswordPage.changeSuccessfuly'),
      });
      setTimeout(() => {
        setChangePasswordMessage(null);
      }, DEFAULT_FADE_MESSAGE_TIMEOUT + 200);
      formik.resetForm();
    } catch (err) {
      if (
        err?.response?.data?.code === ERROR_CODES.WRONG_CURRENT_PASSWORD.code
      ) {
        helpers.setFieldError(
          'currentPassword',
          'changePasswordPage.passwordIncorrect',
        );
      }
      if (err?.response?.data?.error === 'Precondition Failed') {
        setChangePasswordMessage({
          type: 'error',
          title: t('changePasswordPage.passwordAlreadyUsed'),
        });
        setTimeout(() => {
          setChangePasswordMessage(null);
        }, DEFAULT_FADE_MESSAGE_TIMEOUT + 200);
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const formik = useFormik<IChangePassword>({
    initialValues: {
      currentPassword: '',
      password: '',
      confirmPassword: '',
    },
    validateOnBlur: false,
    validationSchema: changePasswordSchema,
    onSubmit: handleFormSubmit,
  });

  return (
    <Layout token={context} sidebar={<UserSidebar />} includeSidebar={true}>
      <Head>
        <title>
          {t('headerText')} | {t('changePasswordPage.title')}
        </title>
      </Head>
      {changePasswordMessage && (
        <div className="sticky max-h-0 lg:mx-auto">
          <FadeMessage {...changePasswordMessage} hasClose />
        </div>
      )}
      <form
        className="space-y-8 lg:mx-auto lg:w-100"
        onSubmit={formik.handleSubmit}
      >
        <h6 className="text-subheading font-bold">
          {t('changePasswordPage.title')}
        </h6>
        {hasChangeablePassword === false && (
          <div className="flex w-full space-x-4 rounded-md bg-maroon-100 p-4 text-caption text-red-200">
            <Warning />
            <div className="space-y-2">
              <p className="font-semibold">
                {t('changePasswordPage.ssoTitle')}
              </p>
              <p>{t('changePasswordPage.ssoDescription')}</p>
            </div>
          </div>
        )}
        {hasChangeablePassword === true && (
          <>
            <InputSection
              label={t('changePasswordPage.currentPasswordLabel')}
              name="currentPassword"
              type="password"
              behavior={InputBehavior.password}
              placeholder={t('changePasswordPage.currentPasswordPlaceholder')}
              inputWrapperClassName="mb-2"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.currentPassword}
              error={
                formik.touched.currentPassword && formik.errors.currentPassword
              }
            />
            <div className="h-1px w-full bg-gray-200" />

            <div className="relative mb-6">
              <InputSection
                label={t('changePasswordPage.newPasswordLabel')}
                name="password"
                type="password"
                hideErrorMessage
                behavior={InputBehavior.password}
                placeholder={t('changePasswordPage.newPasswordPlaceholder')}
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
              label={t('changePasswordPage.confirmPasswordLabel')}
              name="confirmPassword"
              type="password"
              behavior={InputBehavior.password}
              placeholder={t('changePasswordPage.confirmPasswordPlaceholder')}
              inputWrapperClassName="mb-2"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.confirmPassword}
              error={
                formik.touched.confirmPassword && formik.errors.confirmPassword
              }
            />
            <div className="flex justify-end">
              <Button
                disabled={!formik.isValid || isChangingPassword}
                avoidFullWidth
                type="submit"
                variant="primary"
                size="small"
                isLoading={isChangingPassword}
              >
                {t('changePasswordPage.saveChanges')}
              </Button>
            </div>
          </>
        )}
      </form>
    </Layout>
  );
};
