import { User } from '@sentry/nextjs';
import { useState } from 'react';
import API_PATHS from '../constants/apiPaths';
import { centralHttp } from '../http';
import { BaseResponseDto } from '../models/BaseResponse.dto';
import { useRouter } from 'next/router';
import WEB_PATHS from '../constants/webPaths';
import { getErrorMessages } from '../utils/error';
import useTranslation from '../i18n/useTranslation';

export function useAccountSettingPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>();
  const [isLoading, setLoading] = useState<boolean>();
  const [user, setUser] = useState<User>(null);

  interface AccountSetting {
    emailNotificationLanguage: string;
  }

  async function fetchUser() {
    const { data } = await centralHttp.get<BaseResponseDto<User>>(
      API_PATHS.PROFILE,
    );

    setUser(data.data);
  }

  async function saveChanges(value: AccountSetting) {
    try {
      setLoading(true);
      const payload = {
        emailNotificationLanguage: value.emailNotificationLanguage,
      };
      await centralHttp.patch(
        API_PATHS.PROFILE_EMAIL_NOTIFICATION_LANGUAGE,
        payload,
      );
      setSuccessMessage(t('accountSettingPage.saveSuccess'));
    } catch (error) {
      const errors = getErrorMessages(error);
      setErrors(errors);
    } finally {
      setLoading(false);
    }
  }

  async function onCancel() {
    await router.push(WEB_PATHS.DASHBOARD);
  }

  function clearSuccessMessage() {
    setSuccessMessage('');
  }

  function clearErrors() {
    setErrors([]);
  }

  return {
    onCancel,
    saveChanges,
    errors,
    successMessage,
    isLoading,
    fetchUser,
    user,
    clearSuccessMessage,
    clearErrors,
  };
}
