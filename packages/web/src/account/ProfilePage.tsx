import Head from 'next/head';

import Layout from '../layouts/main.layout';
import useTranslation from '../i18n/useTranslation';
import UserSidebar from '../ui-kit/sidebars/UserSidebar';
import ErrorMessages from '../ui-kit/ErrorMessage';
import SuccessMessage from '../ui-kit/SuccessMessage';
import { useProfilePage } from './useProfilePage';
import { ITokenProps } from '../models/auth';
import { useEffect } from 'react';
import { ProfileForm } from './ProfileForm';
import { captureError } from '../utils/error-routing';

interface IProfilePage {
  token: ITokenProps;
}

function ProfilePage(props: IProfilePage) {
  const { t } = useTranslation();
  const {
    handleSubmit,
    errors,
    clearErrors,
    successMessage,
    clearSuccessMessage,
    isLoading,
    fetchUser,
    fetchIndustries,
    fetchCompanySizeRanges,
    user,
    companySizeRanges,
    industries,
  } = useProfilePage();

  useEffect(() => {
    fetchUser().catch(captureError);
    fetchIndustries().catch(captureError);
    fetchCompanySizeRanges().catch(captureError);
  }, []);

  return (
    <Layout token={props.token} sidebar={<UserSidebar />} includeSidebar={true}>
      <Head>
        <title>
          {t('headerText')} | {t('profilePage.metaTitle')}
        </title>
      </Head>
      {user && (
        <ProfileForm
          user={user}
          companySizeRanges={companySizeRanges}
          industries={industries}
          onSubmit={handleSubmit}
          errorComponent={
            <ErrorMessages messages={errors} onClearAction={clearErrors} />
          }
          successComponent={
            <SuccessMessage
              title={successMessage}
              onClearAction={clearSuccessMessage}
            />
          }
          loading={isLoading}
        />
      )}
    </Layout>
  );
}

export default ProfilePage;
