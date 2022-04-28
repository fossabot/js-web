import { useFormik } from 'formik';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useToasts } from 'react-toast-notifications';
import API_PATHS from '../../constants/apiPaths';
import { EMAIL_NOTIFICATION_PREVIEW } from '../../constants/localstorage';
import WEB_PATHS from '../../constants/webPaths';
import { notificationHttp } from '../../http';
import useTranslation from '../../i18n/useTranslation';
import { BaseResponseDto } from '../../models/BaseResponse.dto';
import {
  EmailNotification,
  EmailNotificationEditorFormikType,
  EmailNotificationSenderDomain,
  EmailNotificationValidationSchema,
} from '../../models/emailNotification';
import { LanguageCapitalized } from '../../models/language';
import { NotificationReceiverRole } from '../../models/notification';
import { Mail } from '../../ui-kit/icons';
import { toastMessage } from '../../ui-kit/ToastMessage';
import { captureError } from '../../utils/error-routing';

export function useEmailNotificationEditPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const id = router.query.id as string;
  const [emailNotification, setEmailNotification] =
    useState<EmailNotification>(null);
  const [senderDomains, setSenderDomains] = useState<
    { label: string; value: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const { addToast } = useToasts();

  const formik = useFormik<EmailNotificationEditorFormikType>({
    initialValues: {
      senderEmailUser: '',
      senderEmailDomainId: '',
      receiverRoles: [],
      emailFormatEnId: '',
      emailFormatThId: '',
      subject: {
        nameEn: '',
        nameTh: '',
      },
      bodyHTML: {
        nameEn: '',
        nameTh: '',
      },
      availableVariables: [],
    },
    validationSchema: EmailNotificationValidationSchema,
    onSubmit: handleSubmit,
  });

  async function fetchData() {
    try {
      const result = await notificationHttp.get<
        BaseResponseDto<EmailNotification>
      >(API_PATHS.EMAIL_NOTIFICATION_ID.replace(':id', id));
      const emailNotification = result.data.data;
      setEmailNotification(emailNotification);

      formik.setValues({
        receiverRoles: emailNotification.receiverRoles,
        emailFormatEnId: emailNotification.emailFormatEn.id,
        emailFormatThId: emailNotification.emailFormatTh.id,
        senderEmailUser: emailNotification.senderEmailUser,
        senderEmailDomainId: emailNotification.senderEmailDomain.id,
        subject: emailNotification.subject,
        bodyHTML: emailNotification.bodyHTML,
        availableVariables: emailNotification.availableVariables.map(
          (v) => v.alias,
        ),
      });
    } catch (err) {
      captureError(err);
    }
  }

  async function fetchSenderDomains() {
    try {
      const result = await notificationHttp.get<
        BaseResponseDto<EmailNotificationSenderDomain[]>
      >(API_PATHS.EMAIL_NOTIFICATION_SENDER_DOMAIN);
      setSenderDomains(
        result.data.data.map((it) => ({ label: it.domain, value: it.id })),
      );
    } catch (err) {
      captureError(err);
    }
  }

  function toggleReceiverRole(role: NotificationReceiverRole) {
    if (formik.values.receiverRoles.includes(role)) {
      formik.setFieldValue(
        'receiverRoles',
        formik.values.receiverRoles.filter((it) => it !== role),
      );
    } else {
      formik.setFieldValue('receiverRoles', [
        ...formik.values.receiverRoles,
        role,
      ]);
    }
  }

  async function handleSubmit() {
    try {
      setLoading(true);
      await notificationHttp.put(
        API_PATHS.EMAIL_NOTIFICATION_ID.replace(':id', id),
        formik.values,
      );

      addToast(
        toastMessage({
          icon: <Mail className="h-5 w-5" />,
          title: (
            <div className="text-caption font-semibold text-gray-650">
              {t('emailNotificationEditorPage.saveSuccess')}
            </div>
          ),
        }),
        { appearance: 'success' },
      );
    } catch (error) {
      captureError(error);
    } finally {
      setLoading(false);
    }
  }

  function previewEmailNotification(lang: LanguageCapitalized) {
    window.localStorage.setItem(
      EMAIL_NOTIFICATION_PREVIEW,
      JSON.stringify(formik.values),
    );
    window.open(
      WEB_PATHS.EMAIL_NOTIFICATION_PREVIEW +
        `?lang=${lang.toLocaleLowerCase()}`,
      '_blank',
    );
  }

  useEffect(() => {
    fetchData();
    fetchSenderDomains();
  }, [id]);

  return {
    formik,
    loading,
    emailNotification,
    senderDomains,
    toggleReceiverRole,
    previewEmailNotification,
  };
}
