import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import API_PATHS from '../../constants/apiPaths';
import { EMAIL_NOTIFICATION_PREVIEW } from '../../constants/localstorage';
import { notificationHttp } from '../../http';
import { BaseResponseDto } from '../../models/BaseResponse.dto';
import { EmailFormat } from '../../models/emailFormat';
import { EmailNotificationEditorFormikType } from '../../models/emailNotification';
import { LanguageCapitalized, LanguageCode } from '../../models/language';
import { captureError } from '../../utils/error-routing';

export function useEmailNotificationPreviewPage() {
  const router = useRouter();
  const lang = (router.query.lang as string) || LanguageCode.EN;

  const [emailNotificationPreview, setEmailNotificationPreview] = useState<
    Partial<EmailNotificationEditorFormikType>
  >({});
  const [emailFormatPreview, setEmailFormatPreview] =
    useState<EmailFormat>(null);

  function getValues() {
    const value = window.localStorage.getItem(EMAIL_NOTIFICATION_PREVIEW);
    try {
      setEmailNotificationPreview(JSON.parse(value) || {});
    } catch (error) {
      console.error(error);
    }
  }

  async function getEmailFormat(id: string) {
    try {
      if (!id)
        throw new Error(
          "Can't get a valid email Format ID for preview the email notification.",
        );

      const res = await notificationHttp.get<BaseResponseDto<EmailFormat>>(
        API_PATHS.EMAIL_FORMAT_ID.replace(':id', id),
      );
      const format = res.data.data;
      setEmailFormatPreview(format);
    } catch (error) {
      captureError(error);
    }
  }

  function getBodyHTML() {
    if (!emailNotificationPreview) return '';

    const fieldName = `name${
      lang.toLowerCase() === 'en'
        ? LanguageCapitalized.EN
        : LanguageCapitalized.TH
    }`;

    // TODO: Provide dummy variables data and replace them.

    return emailNotificationPreview.bodyHTML[fieldName];
  }

  useEffect(() => {
    if (emailNotificationPreview) {
      if (
        lang === LanguageCode.TH &&
        emailNotificationPreview.emailFormatThId
      ) {
        getEmailFormat(emailNotificationPreview.emailFormatThId);
      } else if (emailNotificationPreview.emailFormatEnId) {
        getEmailFormat(emailNotificationPreview.emailFormatEnId);
      }
    }
  }, [emailNotificationPreview]);

  return {
    getValues,
    getBodyHTML,
    emailNotificationPreview,
    emailFormatPreview,
  };
}
