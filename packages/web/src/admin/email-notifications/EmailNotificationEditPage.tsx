import { NextPage } from 'next';
import Head from 'next/head';
import cx from 'classnames';
import {
  FC,
  ReactNode,
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { AccessControl } from '../../app-state/accessControl';
import { BACKEND_ADMIN_CONTROL } from '../../constants/policies';
import WEB_PATHS from '../../constants/webPaths';
import useTranslation from '../../i18n/useTranslation';
import { AdminLayout } from '../../layouts/admin.layout';
import { ITokenProps } from '../../models/auth';
import { EmailNotificationEditorFormikType } from '../../models/emailNotification';
import { AdminBack } from '../../ui-kit/AdminBack';
import Button from '../../ui-kit/Button';
import { Eye, PencilThick } from '../../ui-kit/icons';
import InputCheckbox from '../../ui-kit/InputCheckbox';
import { InputSectionWithSelect } from '../../ui-kit/InputSectionWithSelect';
import { useEmailNotificationEditPage } from './useEmailNotificationEditPage';

import InputSection from '../../ui-kit/InputSection';
import InputSelect from '../../ui-kit/InputSelect';
import useAsyncInput from '../../hooks/useAsyncInput';
import { notificationHttp } from '../../http';
import API_PATHS from '../../constants/apiPaths';
import { FormikProps } from 'formik';
import { LanguageCapitalized } from '../../models/language';
import { EMAIL_NOTIFICATION_PREVIEW } from '../../constants/localstorage';
import { useRouter } from 'next/router';
import {
  INotificationVariable,
  NotificationReceiverRole,
} from '../../models/notification';

const ReactQuill =
  typeof window === 'object' ? require('react-quill') : () => false;
import 'react-quill/dist/quill.snow.css';

export interface IVariableButtonProps {
  variable: INotificationVariable;
  disabled: boolean;
  onClickVariable: (variable: INotificationVariable) => void;
}

const VariableButton: FC<IVariableButtonProps> = ({
  variable,
  disabled,
  onClickVariable,
}) => {
  return (
    <div
      className={cx('rounded border px-3 py-1 text-caption font-semibold', {
        'cursor-pointer border-gray-200 text-brand-primary': !disabled,
        'border-gray-300 text-gray-400': disabled,
      })}
      title={variable.description}
      onClick={() => onClickVariable(variable)}
    >
      {variable.name}
    </div>
  );
};
export interface IAvailableVariablesProps {
  variables: INotificationVariable[];
  disabled: boolean;
  onClickVariable: (variable: INotificationVariable) => void;
}

const AvailableVariables: FC<IAvailableVariablesProps> = ({
  variables,
  disabled,
  onClickVariable,
}) => {
  return (
    <div
      className={cx(
        'my-6 flex select-none flex-wrap gap-2 rounded-lg border border-gray-300 p-3',
        {
          'pointer-events-none bg-gray-200': disabled,
        },
      )}
    >
      {variables.map((variable) => (
        <VariableButton
          key={variable.alias}
          variable={variable}
          disabled={disabled}
          onClickVariable={onClickVariable}
        />
      ))}
    </div>
  );
};

export interface ILanguageTabHeadingProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}

const LanguageTabHeading: FC<ILanguageTabHeadingProps> = ({
  children,
  active,
  onClick,
}) => {
  return (
    <div
      className={cx('cursor-pointer select-none pb-4 text-body font-semibold', {
        'border-b-2 border-brand-primary text-brand-primary': active,
        'text-gray-500': !active,
      })}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface ILanguageTabContentProps {
  formik: FormikProps<EmailNotificationEditorFormikType>;
  language: LanguageCapitalized;
  currentTab: LanguageCapitalized;
  isEditing: boolean;
  availableVariables: INotificationVariable[];
}

const LanguageTabContent: FC<ILanguageTabContentProps> = ({
  formik,
  language,
  currentTab,
  isEditing,
  availableVariables,
}) => {
  const { t } = useTranslation();
  const editorRef = useRef(null);

  const {
    options: emailFormatOptions,
    getOptions: getEmailFormatOptions,
    inputValue: emailFormatInputValue,
  } = useAsyncInput({
    http: notificationHttp,
    apiPath: API_PATHS.EMAIL_FORMAT,
    fieldName: 'formatName',
    formikFieldValue: formik.values[`emailFormat${language}Id`],
  });

  const handleClickVariable = useCallback(
    (variable) => {
      const quill = editorRef.current.getEditor();
      const selection = quill.getSelection(true);
      quill.insertText(selection.index, `{{${variable.alias}}}`);
    },
    [editorRef],
  );

  const languageNotation = useMemo(
    () => ` (${language.toUpperCase()})`,
    [language],
  );

  return (
    <div
      className={cx({
        hidden: currentTab !== language,
      })}
    >
      <InputSection
        formik={formik}
        name={`subject.name${language}`}
        label={t('emailNotificationEditorPage.emailSubject') + languageNotation}
        inputClassName="mb-6"
        value={formik.values.subject?.[`name${language}`] || ''}
        error={
          formik.touched.subject?.[`name${language}`] &&
          formik.errors.subject?.[`name${language}`]
        }
        onChange={formik.handleChange}
        disabled={!isEditing}
      />

      <InputSelect
        formik={formik}
        name={`emailFormat${language}Id`}
        label={t('emailNotificationEditorPage.emailFormat') + languageNotation}
        value={emailFormatInputValue}
        isAsync={true}
        isSearchable={true}
        promiseOptions={getEmailFormatOptions}
        options={emailFormatOptions}
        placeholder={t('emailNotificationEditorPage.selectEmailFormat')}
        onBlur={formik.handleBlur}
        selectClassWrapperName="mb-6"
        onChange={formik.handleChange}
        isDisabled={!isEditing}
      />

      <AvailableVariables
        variables={availableVariables}
        disabled={!isEditing}
        onClickVariable={handleClickVariable}
      />

      <ReactQuill
        ref={editorRef}
        theme="snow"
        className={cx('mb-3', {
          'bg-gray-200 text-gray-400': !isEditing,
        })}
        readOnly={!isEditing}
        value={formik.values.bodyHTML?.[`name${language}`]}
        onChange={(content, delta, src, editor) =>
          formik.setFieldValue(
            `bodyHTML.name${language}`,
            editor.getText().trim() ? editor.getHTML() : '',
          )
        }
      />
      {!!formik.touched.bodyHTML?.[`name${language}`] &&
      !!formik.errors.bodyHTML?.[`name${language}`] ? (
        <div className="text-footnote text-red-300">
          {t(formik.errors.bodyHTML[`name${language}`])}
        </div>
      ) : null}
    </div>
  );
};

export const EmailNotificationEditPage: NextPage<ITokenProps> = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    formik,
    loading,
    emailNotification,
    senderDomains,
    toggleReceiverRole,
    previewEmailNotification,
  } = useEmailNotificationEditPage();
  const [languageTab, setLanguageTab] = useState<LanguageCapitalized>(
    LanguageCapitalized.EN,
  );
  const [isEditing, setIsEditing] = useState(false);

  const goBack = useCallback(() => {
    router.push(WEB_PATHS.EMAIL_NOTIFICATIONS);
  }, [router]);

  useEffect(() => {
    return () => {
      window.localStorage.removeItem(EMAIL_NOTIFICATION_PREVIEW);
    };
  }, []);

  if (!emailNotification) return null;

  return (
    <AccessControl
      policyNames={[
        BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
        BACKEND_ADMIN_CONTROL.ACCESS_EMAIL_NOTIFICATIONS,
      ]}
    >
      <AdminLayout>
        <Head>
          <title>
            {t('headerText')} | {t('emailNotificationListPage.headerTitle')}
          </title>
        </Head>
        <form onSubmit={formik.handleSubmit} autoComplete="off">
          <AdminBack path={WEB_PATHS.EMAIL_NOTIFICATIONS} />
          <div className="mx-auto w-full lg:w-140">
            <div className="mb-4 text-subtitle font-semibold">
              {t('emailNotificationEditorPage.emailNotificationEditor')}
            </div>

            <div className="mb-8 border-t border-gray-200 pt-8">
              {!!emailNotification?.category?.parent && (
                <div className="mb-3 flex items-center">
                  <div className="mr-4 min-w-40 text-caption font-semibold">
                    {t('emailNotificationEditorPage.notificationCategory')}:
                  </div>
                  <div className="text-caption">
                    {emailNotification.category.parent.name}
                  </div>
                </div>
              )}
              <div className="flex items-center">
                <div className="mr-4 min-w-40 text-caption font-semibold">
                  {t('emailNotificationEditorPage.notificationType')}:
                </div>
                <div className="text-caption">
                  {emailNotification.category.name}
                </div>
              </div>
            </div>

            <div className="mb-8 border-t border-gray-200 pt-8">
              <div className="mb-4 min-w-36 text-caption font-semibold">
                {t('emailNotificationEditorPage.receiverRole')}
              </div>
              <div className="mb-6">
                <div className="flex items-center space-x-4">
                  <InputCheckbox
                    formik={formik}
                    name="receiver_role_moderator"
                    label={t('emailNotificationEditorPage.moderator')}
                    checked={formik.values.receiverRoles.includes(
                      NotificationReceiverRole.MODERATOR,
                    )}
                    onChange={() =>
                      toggleReceiverRole(NotificationReceiverRole.MODERATOR)
                    }
                  />
                  <InputCheckbox
                    formik={formik}
                    name="receiver_role_learner"
                    label={t('emailNotificationEditorPage.learner')}
                    checked={formik.values.receiverRoles.includes(
                      NotificationReceiverRole.LEARNER,
                    )}
                    onChange={() =>
                      toggleReceiverRole(NotificationReceiverRole.LEARNER)
                    }
                  />
                  <InputCheckbox
                    formik={formik}
                    name="receiver_role_instructor"
                    label={t('emailNotificationEditorPage.instructor')}
                    checked={formik.values.receiverRoles.includes(
                      NotificationReceiverRole.INSTRUCTOR,
                    )}
                    onChange={() =>
                      toggleReceiverRole(NotificationReceiverRole.INSTRUCTOR)
                    }
                  />
                </div>
                {formik.touched.receiverRoles && (
                  <div className="mt-4 text-footnote text-red-200">
                    {formik.errors.receiverRoles}
                  </div>
                )}
              </div>

              <div className="mb-4 min-w-36 text-caption font-semibold">
                {t('emailNotificationEditorPage.from')}
              </div>

              <InputSectionWithSelect
                dropdownDirection="right"
                dropdownNoShrink={true}
                inputSelectProps={{
                  name: 'senderEmailDomain',
                  onChange: formik.handleChange,
                  onBlur: formik.handleBlur,
                  value:
                    senderDomains.find(
                      (it) => it.value === formik.values.senderEmailDomainId,
                    ) || senderDomains[0],
                  placeholder: 'Select...',
                  renderOptions: senderDomains,
                  error:
                    formik.touched.senderEmailDomainId &&
                    formik.errors.senderEmailDomainId,
                }}
                inputSectionProps={{
                  formik,
                  type: 'text',
                  name: 'senderEmailUser',
                  value: formik.values.senderEmailUser,
                  onBlur: formik.handleBlur,
                  onChange: formik.handleChange,
                  error:
                    formik.touched.senderEmailUser &&
                    formik.errors.senderEmailUser,
                }}
              />
            </div>

            <div className="mb-8 flex items-center justify-between border-t border-gray-200 pt-8">
              <div className="text-subheading font-bold">
                {t('emailNotificationEditorPage.content')}
              </div>
              <div className="w-22">
                <Button
                  variant="secondary"
                  size="medium"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <PencilThick className="mr-1.5 h-4 w-4" />
                  <span className="text-caption">
                    {t('emailNotificationEditorPage.edit')}
                  </span>
                </Button>
              </div>
            </div>

            <div className="mb-6 flex items-center space-x-8">
              <LanguageTabHeading
                active={languageTab === 'En'}
                onClick={() => setLanguageTab(LanguageCapitalized.EN)}
              >
                English
              </LanguageTabHeading>
              <LanguageTabHeading
                active={languageTab === 'Th'}
                onClick={() => setLanguageTab(LanguageCapitalized.TH)}
              >
                ภาษาไทย
              </LanguageTabHeading>
            </div>

            <LanguageTabContent
              language={LanguageCapitalized.EN}
              currentTab={languageTab}
              formik={formik}
              isEditing={isEditing}
              availableVariables={emailNotification.availableVariables}
            />
            <LanguageTabContent
              language={LanguageCapitalized.TH}
              currentTab={languageTab}
              formik={formik}
              isEditing={isEditing}
              availableVariables={emailNotification.availableVariables}
            />

            <div className="mt-8 mb-10 flex select-none items-center">
              <div className="flex-1">
                <div
                  className="flex cursor-pointer items-center font-semibold text-gray-650"
                  onClick={() => previewEmailNotification(languageTab)}
                >
                  <Eye className="mr-1 h-6 w-6" />
                  <span>{t('emailNotificationEditorPage.preview')}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2.5">
                <Button
                  variant="secondary"
                  size="medium"
                  className="w-24"
                  onClick={() => goBack()}
                >
                  {t('emailNotificationEditorPage.cancel')}
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  size="medium"
                  className="w-36 whitespace-nowrap"
                  isLoading={loading}
                >
                  {t('emailNotificationEditorPage.saveChanges')}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </AdminLayout>
    </AccessControl>
  );
};
