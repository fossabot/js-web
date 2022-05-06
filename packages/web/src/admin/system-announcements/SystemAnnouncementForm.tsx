import { useFormik } from 'formik';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import 'react-quill/dist/quill.snow.css';
import { useToasts } from 'react-toast-notifications';
import config from '../../config';
import WEB_PATHS from '../../constants/webPaths';
import useTranslation from '../../i18n/useTranslation';
import { Language } from '../../models/language';
import { ISystemAnnouncement } from '../../models/systemAnnouncement';
import { SystemAnnouncementModal } from '../../system-announcement/SystemAnnouncementModal';
import Button from '../../ui-kit/Button';
import FileUploadButton from '../../ui-kit/FileUploadButton';
import { Check, Close, Eye, Warning } from '../../ui-kit/icons';
import { InputDatePicker } from '../../ui-kit/InputDatePicker';
import InputSection from '../../ui-kit/InputSection';
import ReactQuillWithLang from '../../ui-kit/ReactQuillWithLang';
import { toastMessage } from '../../ui-kit/ToastMessage';
import {
  saveSystemAnnouncement,
  systemAnnouncementFormValidationSchema,
} from './systemAnnouncementForm.utils';

export interface ISystemAnnouncementForm {
  title: Language;
  startDate: Date | null;
  endDate: Date | null;
  message: Language;
  messageStartDateTime: Date | null;
  messageEndDateTime: Date | null;
  file: File | null;
  imageKey: string | null;
}

interface ISystemAnnouncementFormProps {
  initialValues: ISystemAnnouncement | null;
}

const acceptableFormats = ['.png', '.jpeg', '.jpg'];

export const SystemAnnouncementForm = ({
  initialValues,
}: ISystemAnnouncementFormProps) => {
  const { t } = useTranslation();
  const { addToast } = useToasts();
  const [localeIdx, setLocaleIdx] = useState(0);
  const [isPreviewing, setIsPreviewing] = useState(false);

  const router = useRouter();
  const [imgPreview, setImgPreview] = useState('');

  const onSubmit = useCallback(
    async (values: ISystemAnnouncementForm) => {
      try {
        const res = await saveSystemAnnouncement(values, initialValues?.id);
        addToast(
          toastMessage({
            icon: <Check className="h-5 w-5" />,
            title: initialValues?.id
              ? 'System announcement successfully saved'
              : 'System announcement successfully created',
          }),
          { appearance: 'success' },
        );
        // Set timeout to let user still see the toast
        setTimeout(() => {
          if (!initialValues?.id) {
            router.replace(
              WEB_PATHS.SYSTEM_ANNOUNCEMENT_ID.replace(':id', res.data.data.id),
            );
          }
        }, 500);
      } catch (err) {
        addToast(
          toastMessage({
            icon: <Warning className="h-5 w-5" />,
            title: err?.response?.data?.message || 'Something went wrong',
          }),
          { appearance: 'error' },
        );
      }
    },
    [addToast, initialValues?.id, router],
  );

  const formik = useFormik<ISystemAnnouncementForm>({
    initialValues: {
      title: {
        nameEn: '',
        nameTh: '',
      },
      startDate: null,
      endDate: null,
      message: {
        nameEn: '',
        nameTh: '',
      },
      messageStartDateTime: null,
      messageEndDateTime: null,
      file: null,
      imageKey: null,
    },
    onSubmit,
    validationSchema: systemAnnouncementFormValidationSchema,
  });

  useEffect(() => {
    if (initialValues) {
      formik.setValues({
        title: initialValues.title,
        startDate: new Date(initialValues.startDate),
        endDate: new Date(initialValues.endDate),
        message: initialValues.message,
        messageStartDateTime: new Date(initialValues.messageStartDateTime),
        messageEndDateTime: new Date(initialValues.messageEndDateTime),
        file: null,
        imageKey: initialValues.imageKey,
      });
      if (initialValues.imageKey) {
        setImgPreview(`${config.CDN_BASE_URL}/${initialValues.imageKey}`);
      }
    }
  }, [initialValues]);

  function handleFileChange(event: React.ChangeEvent<{ files: File[] }>) {
    const file = event.target.files[0];

    formik.setFieldValue('file', file);
    if (imgPreview && !imgPreview.startsWith(config.CDN_BASE_URL)) {
      URL.revokeObjectURL(imgPreview);
    }
    setImgPreview(URL.createObjectURL(file));
  }

  function handleRemoveImage() {
    formik.setValues((values) => ({
      ...values,
      file: null,
      imageKey: null,
    }));
    if (imgPreview && !imgPreview.startsWith(config.CDN_BASE_URL)) {
      URL.revokeObjectURL(imgPreview);
    }
    setImgPreview('');
  }

  return (
    <>
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <InputSection
          label={`${t('systemAnnouncementForm.titleLabel')} (EN)`}
          name="titleEn"
          value={formik.values.title.nameEn}
          placeholder={t('systemAnnouncementForm.titlePlaceholder')}
          onChange={(event) => {
            formik.setFieldValue('title.nameEn', event.target.value);
          }}
          error={formik.touched.title?.nameEn && formik.errors.title?.nameEn}
        />
        <InputSection
          label={`${t('systemAnnouncementForm.titleLabel')} (TH)`}
          name="titleTh"
          value={formik.values.title.nameTh}
          placeholder={t('systemAnnouncementForm.titlePlaceholder')}
          onChange={(event) => {
            formik.setFieldValue('title.nameTh', event.target.value);
          }}
        />
        <InputDatePicker
          label={t('systemAnnouncementForm.activeDurationLabel')}
          placeholder="DD / MM / YYYY"
          startDate={formik.values.startDate}
          endDate={formik.values.endDate}
          onChange={([startDate, endDate]) => {
            formik.setValues((values) => ({
              ...values,
              startDate,
              endDate: endDate || startDate,
            }));
          }}
          overrideShowDateRange
          onBlur={() =>
            formik.setTouched({
              ...formik.touched,
              startDate: true,
              endDate: true,
            })
          }
          inputError={formik.touched.startDate && formik.errors.startDate}
        />
        <div className="mt-4 mb-8 h-px w-full bg-gray-200"></div>
        <h2 className="text-subheading font-bold">
          {t('systemAnnouncementForm.announcementDetails')}
        </h2>
        <div className="mt-4 mb-8 h-px w-full bg-gray-200"></div>
        <ReactQuillWithLang
          labelEn={`${t('systemAnnouncementForm.messageLabel')} (EN)`}
          labelTh={`${t('systemAnnouncementForm.messageLabel')} (TH)`}
          name="message"
          value={formik.values.message}
          formik={formik}
        />

        <InputDatePicker
          label={t('systemAnnouncementForm.messageDateTimeLabel')}
          placeholder="DD / MM / YYYY"
          clearable
          withTime
          startDate={formik.values.messageStartDateTime}
          endDate={formik.values.messageEndDateTime}
          onChange={([messageStartDateTime, messageEndDateTime]) => {
            formik.setValues((values) => ({
              ...values,
              messageStartDateTime,
              messageEndDateTime: messageEndDateTime || messageStartDateTime,
            }));
          }}
          overrideShowDateRange
        />

        <div className="flex flex-col">
          <label className="mb-2 text-caption font-semibold">
            {t('systemAnnouncementForm.imageLabel')}
          </label>
          <div className="flex items-center space-x-2">
            <div className="w-44">
              <FileUploadButton
                variant="secondary"
                btnText="Upload Image"
                accept={acceptableFormats}
                onChange={handleFileChange}
              />
            </div>
            {imgPreview && (
              <Button
                avoidFullWidth
                variant="secondary"
                size="medium"
                onClick={handleRemoveImage}
                iconLeft={<Close></Close>}
              >
                {t('remove')}
              </Button>
            )}
          </div>
          <span className="mt-4 text-footnote text-gray-500">
            {t('systemAnnouncementForm.imageNote')}
          </span>
          {imgPreview && (
            <div className="flex justify-center">
              <img
                src={imgPreview}
                className="mt-8 max-h-92 max-w-64 object-contain"
              ></img>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            className="flex w-min items-center space-x-1 p-1 text-gray-650"
            onClick={() => {
              setIsPreviewing(true);
            }}
          >
            <Eye className="h-5 w-5" />
            <span>{t('preview')}</span>
          </button>

          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="small"
              onClick={() => {
                router.push(WEB_PATHS.SYSTEM_ANNOUNCEMENT);
              }}
              type="button"
            >
              {t('cancel')}
            </Button>
            <Button
              variant="primary"
              size="small"
              type="submit"
              isLoading={formik.isSubmitting}
              disabled={formik.isSubmitting}
            >
              {t('save')}
            </Button>
          </div>
        </div>
      </form>
      <SystemAnnouncementModal
        isLocalImage
        data={
          isPreviewing
            ? {
                imageKey: imgPreview,
                message: formik.values.message,
                title: formik.values.title,
                messageStartDateTime: formik.values.messageStartDateTime,
                messageEndDateTime: formik.values.messageEndDateTime,
              }
            : null
        }
        onClose={() => {
          if (localeIdx < router.locales.length - 1)
            setLocaleIdx(localeIdx + 1);
          else {
            setIsPreviewing(false);
            // Avoid text immediately changes during modal closing
            setTimeout(() => setLocaleIdx(0), 500);
          }
        }}
        locale={router.locales[localeIdx]}
      />
    </>
  );
};
