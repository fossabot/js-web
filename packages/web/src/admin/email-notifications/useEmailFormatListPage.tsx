import { useEffect, useState } from 'react';
import API_PATHS from '../../constants/apiPaths';
import { EMAIL_FORMAT_PREVIEW } from '../../constants/localstorage';
import { notificationHttp } from '../../http';
import { EmailFormatFormSchema } from './emailFormatForm.schema';
import { useModal } from '../../ui-kit/Modal';
import { FormikHelpers } from 'formik';
import { EmailFormat } from '../../models/emailFormat';
import useList from '../../hooks/useList';
import { useEmailFormat } from './useEmailFormat';
import { useToasts } from 'react-toast-notifications';
import { toastMessage } from '../../ui-kit/ToastMessage';
import { Mail } from '../../ui-kit/icons';
import useTranslation from '../../i18n/useTranslation';

export function useEmailFormatListPage() {
  const emailFormatModalCreate = useModal();
  const emailFormatModalEdit = useModal();
  const emailFormats = useList<EmailFormat>((options) => {
    return notificationHttp.get(API_PATHS.EMAIL_FORMAT, { params: options });
  });
  const [item2edit, setItem2Edit] = useState<EmailFormat>(null);
  const {
    previewEmailFormat,
    createEmailFormat,
    editEmailFormat,
    removeEmailFormat,
  } = useEmailFormat();
  const emailFormatModalRemove = useModal();
  const { addToast } = useToasts();
  const { t } = useTranslation();

  useEffect(() => {
    return () => {
      window.localStorage.removeItem(EMAIL_FORMAT_PREVIEW);
    };
  });

  async function handleSubmitEmailFormat(
    values: EmailFormatFormSchema,
    formikHelpers: FormikHelpers<EmailFormatFormSchema>,
  ) {
    await createEmailFormat(values);
    emailFormatModalCreate.toggle();
    formikHelpers.resetForm();
    await emailFormats.fetchData();
  }

  function handleEditEmailFormat(item: EmailFormat) {
    setItem2Edit(item);
    emailFormatModalEdit.toggle();
  }

  async function handleSubmitEditEmailFormat(values: EmailFormatFormSchema) {
    await editEmailFormat(item2edit.id, values);
    emailFormatModalEdit.toggle();
    await emailFormats.fetchData();
  }

  function handleRemoveEmailFormat(item: EmailFormat) {
    setItem2Edit(item);
    emailFormatModalRemove.toggle();
  }

  async function handleConfirmRemoveEmailFormat() {
    await removeEmailFormat(item2edit.id);
    emailFormatModalRemove.toggle();
    await emailFormats.fetchData();
    addToast(
      toastMessage({
        icon: <Mail className="h-5 w-5" />,
        title: (
          <div className="text-caption font-semibold text-gray-650">
            {t('emailFormatListPage.hasBeenRemoved', {
              item: (
                <span className="text-brand-primary">
                  {item2edit.formatName}
                </span>
              ),
            })}
          </div>
        ),
      }),
      { appearance: 'info' },
    );
  }

  return {
    previewEmailFormat,
    handleSubmitEmailFormat,
    emailFormatModalCreate,
    emailFormatModalEdit,
    emailFormats,
    item2edit,
    handleEditEmailFormat,
    handleSubmitEditEmailFormat,
    handleRemoveEmailFormat,
    emailFormatModalRemove,
    handleConfirmRemoveEmailFormat,
  };
}
