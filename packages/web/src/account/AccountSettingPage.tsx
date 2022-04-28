import Head from 'next/head';
import Layout from '../layouts/main.layout';
import { ITokenProps } from '../models/auth';
import UserSidebar from '../ui-kit/sidebars/UserSidebar';
import useTranslation from '../i18n/useTranslation';
import RadioButton from '../ui-kit/RadioButton';
import Button from '../ui-kit/Button';
import { useAccountSettingPage } from './useAccoutSettingPage';
import { useEffect } from 'react';
import { captureError } from '../utils/error-routing';
import { Formik } from 'formik';
import SuccessMessage from '../ui-kit/SuccessMessage';
import { LanguageCode } from '../models/language';
import ErrorMessages from '../ui-kit/ErrorMessage';

interface IAccountSettingPage {
  token: ITokenProps;
}

interface ILanguageSelect {
  emailNotificationLanguage: string;
}

function AccountSettingPage(props: IAccountSettingPage) {
  const { t } = useTranslation();
  const {
    errors,
    successMessage,
    isLoading,
    fetchUser,
    user,
    saveChanges,
    onCancel,
    clearSuccessMessage,
    clearErrors,
  } = useAccountSettingPage();

  useEffect(() => {
    fetchUser().catch(captureError);
  }, []);

  return (
    <Layout token={props.token} sidebar={<UserSidebar />} includeSidebar={true}>
      <Head>
        <title>
          {t('headerText')} | {t('accountSettingPage.title')}
        </title>
      </Head>
      <SuccessMessage
        title={successMessage}
        onClearAction={clearSuccessMessage}
      />
      <ErrorMessages messages={errors} onClearAction={clearErrors} />
      {user && (
        <Formik<ILanguageSelect>
          initialValues={{
            emailNotificationLanguage: user?.emailNotificationLanguage,
          }}
          onSubmit={(value) => saveChanges(value)}
        >
          {(formik) => (
            <form
              className="flex flex-1 flex-col lg:mx-auto lg:w-100 lg:space-y-8"
              onSubmit={formik.handleSubmit}
            >
              <h6 className="hidden flex-none border-b border-[#ECEDED] pb-8 text-subheading font-bold lg:block">
                {t('accountSettingPage.title')}
              </h6>
              <div className="flex-1 lg:flex-none">
                <h6 className="border-[#ECEDED] pb-8 text-subheading font-bold">
                  {t('accountSettingPage.emailNotifications')}
                </h6>
                <p className="text-caption font-semibold">
                  {t('accountSettingPage.emailNotificationsLanguage')}
                </p>
                <div className="mt-2 space-y-4 text-body lg:flex lg:space-y-0 lg:space-x-6">
                  <label className="flex w-full cursor-pointer items-center space-x-3 rounded-xl border border-gray-300 py-2 px-4">
                    <RadioButton
                      inputClassName={'p-3 cursor-pointer'}
                      {...formik.getFieldProps('emailNotificationLanguage')}
                      value={LanguageCode.TH}
                      checked={
                        formik.values.emailNotificationLanguage ===
                        LanguageCode.TH
                      }
                    />
                    <span className="font-regular">
                      {t('accountSettingPage.language.th')}
                    </span>
                  </label>
                  <label className="flex w-full cursor-pointer items-center space-x-3 rounded-xl border border-gray-300 py-2 px-4">
                    <RadioButton
                      inputClassName={'p-3 cursor-pointer'}
                      {...formik.getFieldProps('emailNotificationLanguage')}
                      value={LanguageCode.EN}
                      checked={
                        formik.values.emailNotificationLanguage ===
                        LanguageCode.EN
                      }
                    />
                    <span className="font-regular">
                      {t('accountSettingPage.language.en')}
                    </span>
                  </label>
                </div>
              </div>
              <div className="sticky bottom-0 mt-8 flex flex-none space-x-4 border-t border-gray-200 bg-white py-4 lg:static lg:flex lg:justify-end lg:py-8">
                <Button
                  className="flex-grow lg:flex-none"
                  avoidFullWidth
                  variant="secondary"
                  size="medium"
                  onClick={onCancel}
                >
                  {t('accountSettingPage.cancel')}
                </Button>
                <Button
                  className="w-2/3 flex-grow lg:w-auto lg:flex-none"
                  avoidFullWidth
                  variant="primary"
                  size="medium"
                  type="submit"
                  isLoading={isLoading}
                >
                  {t('accountSettingPage.saveChanges')}
                </Button>
              </div>
            </form>
          )}
        </Formik>
      )}
    </Layout>
  );
}

export default AccountSettingPage;
