import { Dialog } from '@headlessui/react';
import { Field, Formik, FormikConfig, FormikProps, getIn } from 'formik';
import mime from 'mime';
import { Dispatch, FC, useRef } from 'react';
import config from '../../config';
import useTranslation from '../../i18n/useTranslation';
import Button from '../../ui-kit/Button';
import CheckBox from '../../ui-kit/CheckBox';
import FileUploadButton from '../../ui-kit/FileUploadButton';
import { Modal } from '../../ui-kit/HeadlessModal';
import { Close, Eye, Picture } from '../../ui-kit/icons';
import InputSection from '../../ui-kit/InputSection';
import InputTextArea from '../../ui-kit/InputTextArea';
import {
  emailFormatFormSchema,
  EmailFormatFormSchema,
} from './emailFormatForm.schema';

export interface IEmailFormatModal {
  isOpen?: boolean;
  onSubmit: FormikConfig<EmailFormatFormSchema>['onSubmit'];
  onPreview: Dispatch<EmailFormatFormSchema>;
  toggle: () => any;
  initialValues?: EmailFormatFormSchema;
}

export const EmailFormatModal: FC<IEmailFormatModal> = (props) => {
  const {
    isOpen = false,
    onSubmit,
    toggle,
    initialValues = {
      formatName: '',
      teamName: '',
      headerImage: '' as any,
      footerImage: '' as any,
      footerHTML: '',
      copyrightText: 'Copyright © ',
      isDefault: false,
    } as EmailFormatFormSchema,
    onPreview,
  } = props;
  const initialFocusRef = useRef(null);
  const { t } = useTranslation();

  function handleClearForm(formik: FormikProps<any>) {
    return () => {
      formik.resetForm();
      toggle();
    };
  }

  return (
    <Formik<EmailFormatFormSchema>
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={emailFormatFormSchema}
      enableReinitialize
    >
      {(formikProps) => (
        <Modal
          className="px-6 py-8"
          isOpen={isOpen}
          toggle={handleClearForm(formikProps)}
          skipOutsideClickEvent={false || formikProps.isSubmitting}
          initialFocusRef={initialFocusRef}
        >
          <Dialog.Title as="div" className="text-subheading font-semibold">
            {t('emailFormatListPage.emailFormat')}
          </Dialog.Title>
          <div className="my-4 border-t border-gray-200" />

          <Field
            as={InputSection}
            name="formatName"
            label={t('emailFormatListPage.emailFormatModal.formatName')}
            placeholder="Enter Format Name"
            error={getIn(formikProps.errors, 'formatName')}
          />
          <Field
            as={InputSection}
            name="teamName"
            label={t('emailFormatListPage.emailFormatModal.teamName')}
            placeholder="Enter Team Name (use in emails)"
            inputWrapperClassName="mt-4"
            error={getIn(formikProps.errors, 'teamName')}
          />
          <div className="mt-4 flex">
            <div className="w-1/2">
              <div className="mb-2 text-caption font-semibold">
                {t('emailFormatListPage.logoHeader')}
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-36">
                  <FileUploadButton
                    name="headerImage"
                    accept={mime.getType('png')}
                    variant="secondary"
                    btnText="Upload"
                    onChange={(event: any) => {
                      formikProps.setFieldValue(
                        'headerImage',
                        event.target.files[0],
                      );
                      event.target.value = null;
                    }}
                  />
                </div>
                {formikProps.values.headerImage !== ('' as any) && (
                  <>
                    <div className="w-1/4 text-caption underline">
                      {typeof formikProps.values.headerImage === 'string' ? (
                        <a
                          href={`${config.CDN_BASE_URL}/${formikProps.values.headerImage}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Header
                        </a>
                      ) : (
                        formikProps.values.headerImage?.name
                      )}
                    </div>
                    <Close
                      className="cursor-pointer text-gray-650"
                      onClick={() =>
                        formikProps.setFieldValue('headerImage', '')
                      }
                    />
                  </>
                )}
              </div>
              {formikProps.errors.headerImage && (
                <span className="pt-2 text-footnote text-red-200">
                  {t(formikProps.errors.headerImage as string)}
                </span>
              )}
            </div>
            <div className="mb-2 w-1/2">
              <div className="mb-2 text-caption font-semibold">
                {t('emailFormatListPage.footer')}
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-36">
                  <FileUploadButton
                    name="footerImage"
                    accept={mime.getType('png')}
                    variant="secondary"
                    btnText="Upload"
                    onChange={(event: any) => {
                      formikProps.setFieldValue(
                        'footerImage',
                        event.target.files[0],
                      );
                      event.target.value = null;
                    }}
                  />
                </div>
                {formikProps.values.footerImage !== ('' as any) && (
                  <>
                    <div className="w-1/4 text-caption underline">
                      {typeof formikProps.values.footerImage === 'string' ? (
                        <a
                          href={`${config.CDN_BASE_URL}/${formikProps.values.footerImage}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Footer
                        </a>
                      ) : (
                        formikProps.values.footerImage?.name
                      )}
                    </div>
                    <Close
                      className="cursor-pointer text-gray-650"
                      onClick={() =>
                        formikProps.setFieldValue('footerImage', '')
                      }
                    />
                  </>
                )}
              </div>
              {formikProps.errors.footerImage && (
                <span className="pt-2 text-footnote text-red-200">
                  {t(formikProps.errors.footerImage as string)}
                </span>
              )}
            </div>
          </div>
          <aside className="mt-4 flex space-x-2">
            <Picture className="h-3 w-3 flex-shrink-0" />
            <div className="text-footnote text-gray-500">
              {t('emailFormatListPage.fileNote', { n: 5 })}
            </div>
          </aside>
          <Field
            as={InputTextArea}
            textareaProps={{
              rows: 1,
              placeholder: 'Enter Footer Text',
            }}
            name="footerHTML"
            label="Footer"
            inputWrapperClassName="mt-4"
            error={getIn(formikProps.errors, 'footerHTML')}
          />
          <Field
            as={InputSection}
            name="copyrightText"
            label={t('emailFormatListPage.emailFormatModal.copyrightText')}
            inputWrapperClassName="mt-4"
            error={getIn(formikProps.errors, 'copyrightText')}
          />
          <label className="mt-8 flex items-center space-x-2">
            <Field
              as={(fieldProps: any) => (
                <CheckBox {...fieldProps} type="square" />
              )}
              name="isDefault"
              type="checkbox"
              disabled={initialValues.isDefault}
            />
            <div className="text-caption">
              {t('emailFormatListPage.markAsDefaultFormat')}
            </div>
          </label>

          <section className="mt-8 flex items-center">
            <div
              className="flex w-1/2 cursor-pointer items-center space-x-2"
              onClick={() => onPreview(formikProps.values)}
            >
              <Eye className="h-4 w-4" />
              <div>{t('emailFormatListPage.preview')}</div>
            </div>
            <div
              className="flex flex-1 flex-row-reverse space-x-3 space-x-reverse"
              ref={initialFocusRef}
            >
              <Button
                variant="primary"
                type="button"
                size="small"
                onClick={formikProps.submitForm}
                disabled={formikProps.isSubmitting}
                isLoading={formikProps.isSubmitting}
                className="font-semibold"
              >
                {props.initialValues ? 'Save Changes' : 'Create Format'}
              </Button>
              <Button
                variant="secondary"
                type="reset"
                size="small"
                onClick={handleClearForm(formikProps)}
                disabled={formikProps.isSubmitting}
                className={'font-semibold'}
              >
                {t('cancel')}
              </Button>
            </div>
          </section>
        </Modal>
      )}
    </Formik>
  );
};
