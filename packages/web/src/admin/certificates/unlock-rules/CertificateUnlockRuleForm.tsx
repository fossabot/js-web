import { FormikProps } from 'formik';

import Button from '../../../ui-kit/Button';
import { centralHttp } from '../../../http';
import { enumToArray } from '../../../utils/array';
import API_PATHS from '../../../constants/apiPaths';
import InputSelect from '../../../ui-kit/InputSelect';
import InputSection from '../../../ui-kit/InputSection';
import useAsyncInput from '../../../hooks/useAsyncInput';
import useTranslation from '../../../i18n/useTranslation';
import { CertificationType } from '../../../models/certificate';
import CertificateUnlockRuleItemForm from './CertificateUnlockRuleItemForm';
import { ICertificateUnlockRule } from '../../../models/certificateUnlockRule';

const CertificateUnlockRuleForm = ({
  formik,
}: {
  formik: FormikProps<ICertificateUnlockRule>;
}) => {
  const { t } = useTranslation();
  const {
    getOptions: getCertificateOptions,
    inputValue: certificateInputValue,
  } = useAsyncInput({
    http: centralHttp.get,
    fieldName: 'title',
    apiPath: API_PATHS.CERTIFICATES,
    formikFieldValue: formik.values.certificateId,
  });

  function onPercentageChange(index: number, percentage: number) {
    const newValues = { ...formik.values };
    if (newValues.unlockType === CertificationType.COURSE) {
      newValues.unlockCourseRuleItems[index].percentage = percentage;
    }
    formik.setValues(newValues);
  }

  return (
    <form onSubmit={formik.handleSubmit} autoComplete="off">
      <div className="mb-6 w-full rounded border border-gray-400 bg-gray-100 p-4 shadow-sm">
        <InputSection
          formik={formik}
          label={'Rule name *'}
          name="ruleName"
          placeholder={'Rule name'}
          inputWrapperClassName="mb-3"
          value={formik.values.ruleName}
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          error={formik.touched.ruleName && formik.errors.ruleName}
        />

        <InputSelect
          formik={formik}
          name="certificateId"
          label="Certificate *"
          value={{
            label:
              certificateInputValue.label ||
              t('certificateUnlockRuleCreatePage.pleaseSelect'),
            value: certificateInputValue.value,
          }}
          isAsync
          promiseOptions={getCertificateOptions}
          placeholder={t('certificateUnlockRuleCreatePage.pleaseSelect')}
          onBlur={formik.handleBlur}
          selectClassWrapperName="mb-3"
          isSearchable
          isDisabled={!!formik.values.id}
          onChange={formik.handleChange}
          error={formik.touched.certificateId && formik.errors.certificateId}
        />

        <InputSelect
          name="unlockType"
          formik={formik}
          label="Unlock Type *"
          options={enumToArray(CertificationType)}
          value={{
            label: enumToArray(CertificationType).find(
              (item) => item === formik.values.unlockType,
            )
              ? enumToArray(CertificationType).find(
                  (item) => item === formik.values.unlockType,
                )
              : t('certificateUnlockRuleCreatePage.pleaseSelect'),
            value: formik.values.unlockType,
          }}
          placeholder={t('certificateUnlockRuleCreatePage.pleaseSelect')}
          onBlur={formik.handleBlur}
          selectClassWrapperName="w-100 mb-3"
          onChange={formik.handleChange}
          error={formik.touched.unlockType && formik.errors.unlockType}
        />

        {formik.values.unlockType === CertificationType.COURSE ? (
          <CertificateUnlockRuleItemForm
            formik={formik}
            key={CertificationType.COURSE}
            type={CertificationType.COURSE}
            items={formik.values.unlockCourseRuleItems}
            onPercentageChange={onPercentageChange}
          />
        ) : (
          <CertificateUnlockRuleItemForm
            formik={formik}
            key={CertificationType.LEARNING_TRACK}
            type={CertificationType.LEARNING_TRACK}
            items={formik.values.unlockLearningTrackRuleItems}
            onPercentageChange={onPercentageChange}
          />
        )}

        <Button
          size="medium"
          variant="primary"
          type="submit"
          disabled={!formik.isValid || formik.isSubmitting}
        >
          Save rule
        </Button>
      </div>
    </form>
  );
};

export default CertificateUnlockRuleForm;
