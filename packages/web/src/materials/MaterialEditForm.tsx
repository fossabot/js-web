import { useField } from 'formik';
import React, { FC, useState } from 'react';
import { MaterialType } from '../models/baseMaterial';
import FileUpload from '../ui-kit/FileUpload';
import InputSection from '../ui-kit/InputSection';
import InputSelect from '../ui-kit/InputSelect';
import RadioButton from '../ui-kit/RadioButton';

interface IMaterialCreateForm {
  fieldNames: {
    displayName: string;
    language: string;
    file: string;
    materialType: string;
    url: string;
  };
}

export const MaterialCreateForm: FC<IMaterialCreateForm> = (props) => {
  const { displayName, language, file, materialType, url } = props.fieldNames;
  const [fieldInputDisplayName, fieldMetaDisplayName] =
    useField<string>(displayName);
  const [fieldInputLanguage, fieldMetaLanguage, fieldHelperLanguage] =
    useField<string>(language);
  const [fieldInputFile, fieldMetaFile, fieldHelperFile] = useField<File>(file);
  const [fieldInputMaterialType] = useField<MaterialType>(materialType);
  const [fieldInputUrl, fieldMetaUrl] = useField<string>(url);
  const [currentLangOption, setLangOption] = useState<string>();
  const acceptableFormats = [
    '.doc',
    '.docx',
    '.pdf',
    '.ppt',
    '.pptx',
    '.xlsx',
    '.xls',
  ];

  function handleFileChange(event: React.ChangeEvent<{ files: File[] }>) {
    const file = event.target.files[0];

    fieldHelperFile.setValue(file);
  }

  function handleLanguageChange(event: React.ChangeEvent<{ value: string }>) {
    const value = event.target.value;

    if (value === 'Other') {
      fieldHelperLanguage.setValue('');
    } else {
      fieldHelperLanguage.setValue(value);
    }
    setLangOption(value);
  }

  return (
    <section className="space-y-4">
      <header className="text-heading font-bold">Create Material</header>
      <label className="block">
        <div className="mb-2 text-caption font-semibold">Display name</div>
        <InputSection
          {...fieldInputDisplayName}
          error={fieldMetaDisplayName.touched && fieldMetaDisplayName.error}
        />
      </label>
      <label className="block">
        <div className="mb-2 text-caption font-semibold">Language</div>
        <InputSelect
          name="languageOptions"
          onChange={handleLanguageChange}
          onBlur={() => null}
          options={['Thai', 'English', 'Other']}
          isClearable
          error={fieldMetaLanguage.touched && fieldMetaLanguage.error}
        />
      </label>
      <label className={currentLangOption === 'Other' ? 'block' : 'hidden'}>
        <InputSection
          {...fieldInputLanguage}
          error={fieldMetaLanguage.touched && fieldMetaLanguage.error}
        />
      </label>
      <div>
        <div className="mb-2 text-caption font-semibold">Material type</div>
        <label className="flex w-full cursor-pointer items-center space-x-3 rounded-xl border border-gray-300 p-4">
          <RadioButton
            inputClassName={'p-3 cursor-pointer'}
            {...fieldInputMaterialType}
            value={MaterialType.MATERIAL_INTERNAL}
            checked={
              fieldInputMaterialType.value === MaterialType.MATERIAL_INTERNAL
            }
            readOnly
          />
          <span>Internal</span>
        </label>
        <label className="mt-4 flex w-full cursor-pointer items-center space-x-3 rounded-xl border border-gray-300 p-4">
          <RadioButton
            inputClassName={'p-3 cursor-pointer'}
            {...fieldInputMaterialType}
            value={MaterialType.MATERIAL_EXTERNAL}
            checked={
              fieldInputMaterialType.value === MaterialType.MATERIAL_EXTERNAL
            }
            readOnly
          />
          <span>External</span>
        </label>
      </div>
      <div
        className={
          fieldInputMaterialType.value === MaterialType.MATERIAL_INTERNAL
            ? 'block'
            : 'hidden'
        }
      >
        <div className="mb-2 text-caption font-semibold">Upload material</div>
        <div className="text-caption">{`Format: ${acceptableFormats.join(
          ', ',
        )}`}</div>
        <div className="mb-2 text-caption">{`Maximum file size: 30 MB`}</div>
        <FileUpload
          name={fieldInputFile.name}
          value={fieldInputFile.value?.name}
          label="Upload"
          accept={acceptableFormats}
          onChange={handleFileChange}
          error={fieldMetaFile.touched && fieldMetaFile.error}
        />
      </div>
      <label
        className={
          fieldInputMaterialType.value === MaterialType.MATERIAL_EXTERNAL
            ? 'block'
            : 'hidden'
        }
      >
        <div className="mb-2 text-caption font-semibold">Url</div>
        <InputSection
          {...fieldInputUrl}
          error={fieldMetaUrl.touched && fieldMetaUrl.error}
        />
      </label>
    </section>
  );
};
