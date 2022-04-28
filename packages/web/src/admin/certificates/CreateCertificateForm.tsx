import { useField } from 'formik';
import useTranslation from '../../i18n/useTranslation';
import {
  CertificationOrientation,
  CertificationType,
} from '../../models/certificate';
import FileUpload from '../../ui-kit/FileUpload';
import InputSection from '../../ui-kit/InputSection';
import InputSelect from '../../ui-kit/InputSelect';
import RadioButton from '../../ui-kit/RadioButton';
import { ICreateCertificateForm } from './createCertificateForm.schema';

const acceptableFormats = ['.png', '.jpeg', '.jpg'];

export const CreateCertificateForm = () => {
  const { t } = useTranslation();

  const [fieldInputTitle, fieldMetaTitle] =
    useField<ICreateCertificateForm['title']>('title');
  const [fieldInputFile, fieldMetaFile, fieldHelperFile] =
    useField<ICreateCertificateForm['file']>('file');
  const [fieldInputOrientation] =
    useField<ICreateCertificateForm['orientation']>('orientation');
  const [fieldInputProvider, fieldMetaProvider] =
    useField<ICreateCertificateForm['provider']>('provider');

  const [fieldInputCertType, fieldMetaCertType, fieldHelperCertType] =
    useField<ICreateCertificateForm['certType']>('certType');

  function handleFileChange(event: React.ChangeEvent<{ files: File[] }>) {
    const file = event.target.files[0];

    fieldHelperFile.setValue(file);
  }

  const typeOptions: { label: string; value: CertificationType }[] = [
    {
      label: t('certificateForm.course'),
      value: CertificationType.COURSE,
    },
    {
      label: t('certificateForm.learningTrack'),
      value: CertificationType.LEARNING_TRACK,
    },
  ];

  return (
    <section className="space-y-4">
      <label className="block">
        <div className="mb-2 text-caption font-semibold">
          {t('certificateForm.certificateTitle')}
        </div>
        <InputSection
          {...fieldInputTitle}
          error={fieldMetaTitle.touched && fieldMetaTitle.error}
        />
      </label>
      <div>
        <div className="mb-2 text-caption font-semibold">
          {t('certificateForm.orientation')}
        </div>
        <label
          className={
            'flex w-full cursor-pointer items-center space-x-3 rounded-xl border border-gray-300 p-4'
          }
        >
          <RadioButton
            inputClassName={'p-3 cursor-pointer'}
            {...fieldInputOrientation}
            value={CertificationOrientation.VERTICAL}
            checked={
              fieldInputOrientation.value === CertificationOrientation.VERTICAL
            }
            readOnly
          />
          <span>{t('certificateForm.vertical')}</span>
        </label>
        <label
          className={
            'mt-4 flex w-full cursor-pointer items-center space-x-3 rounded-xl border border-gray-300 p-4'
          }
        >
          <RadioButton
            inputClassName={'p-3 cursor-pointer'}
            {...fieldInputOrientation}
            value={CertificationOrientation.HORIZONTAL}
            checked={
              fieldInputOrientation.value ===
              CertificationOrientation.HORIZONTAL
            }
            readOnly
          />
          <span>{t('certificateForm.horizontal')}</span>
        </label>
      </div>
      <label className="block">
        <div className="mb-2 text-caption font-semibold">
          {t('certificateForm.type')}
        </div>
        <InputSelect
          name="languageOptions"
          onChange={(e) => {
            fieldHelperCertType.setValue(e.target.value || null);
          }}
          value={
            typeOptions.find(
              (option) => option.value === fieldInputCertType.value,
            ) || null
          }
          onBlur={() => null}
          renderOptions={typeOptions}
          isClearable
          error={fieldMetaCertType.touched && fieldMetaCertType.error}
        />
      </label>
      <label className="block">
        <div className="mb-2 text-caption font-semibold">
          {t('certificateForm.certificateProvider')}
        </div>
        <InputSection
          {...fieldInputProvider}
          error={fieldMetaProvider.touched && fieldMetaProvider.error}
        />
      </label>
      <div>
        <div className="mb-2 text-caption font-semibold">
          {t('certificateForm.uploadTemplate')}
        </div>
        <div className="text-caption">{`Format: ${acceptableFormats.join(
          ', ',
        )}`}</div>
        <div className="text-caption">{`Maximum file size: 30 MB`}</div>
        <div className="mb-2 text-caption">Document page size will be A4</div>
        <FileUpload
          name={fieldInputFile.name}
          value={fieldInputFile.value?.name}
          label="Upload"
          accept={acceptableFormats}
          onChange={handleFileChange}
          error={fieldMetaFile.touched && fieldMetaFile.error}
        />
      </div>
    </section>
  );
};
