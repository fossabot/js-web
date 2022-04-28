import Head from 'next/head';
import { useEffect } from 'react';
import { ProfileForm } from '../account/ProfileForm';
import { useProfilePage } from '../account/useProfilePage';
import { AccessControl } from '../app-state/accessControl';
import { BACKEND_ADMIN_CONTROL } from '../constants/policies';
import useTranslation from '../i18n/useTranslation';
import { AdminLayout } from '../layouts/admin.layout';
import ErrorMessages from '../ui-kit/ErrorMessage';
import SuccessMessage from '../ui-kit/SuccessMessage';
import { captureError } from '../utils/error-routing';
import { useUserProfilePage } from './useUserProfilePage';

export const UserProfilePage = () => {
  const { t } = useTranslation();
  const {
    handleSubmit,
    errors,
    clearErrors,
    successMessage,
    clearSuccessMessage,
    isLoading,
    fetchIndustries,
    fetchCompanySizeRanges,
    companySizeRanges,
    industries,
  } = useProfilePage();
  const { fetchUser, updateProfile, user } = useUserProfilePage();

  useEffect(() => {
    fetchUser().catch(captureError);
    fetchIndustries().catch(captureError);
    fetchCompanySizeRanges().catch(captureError);
  }, []);

  return (
    <AccessControl
      policyNames={[
        BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
        BACKEND_ADMIN_CONTROL.ACCESS_USER_MANAGEMENT,
      ]}
    >
      <AdminLayout>
        <Head>
          <title>{t('headerText')} | User Management</title>
        </Head>
        {user && (
          <ProfileForm
            hideAvatarSection
            user={user}
            companySizeRanges={companySizeRanges}
            industries={industries}
            onSubmit={updateProfile(handleSubmit)}
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
      </AdminLayout>
    </AccessControl>
  );
};
