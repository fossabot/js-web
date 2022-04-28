import cx from 'classnames';
import { ChangeEvent } from 'react';

import useTranslation from '../i18n/useTranslation';

export interface IInputFile {
  formik?: any;
  error?: any;
  label?: string;
  name: string;
  description?: string;
  allowedExtensions: string[];
  onChange: (files: FileList, callback: any) => void;
  inputWrapperClassName?: string;
  hideErrorMessage?: boolean;
  labelClassName?: string;
}

const InputFile = (props: IInputFile) => {
  const {
    name,
    description,
    allowedExtensions = [],
    error,
    label,
    labelClassName,
    inputWrapperClassName,
    hideErrorMessage = false,
  } = props;

  const { t } = useTranslation();

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    files: FileList,
  ) => {
    props.onChange(files, (isValid = true) => {
      if (!isValid) {
        e.target.value = '';
      }
    });
  };

  return (
    <div
      className={cx('flex w-full flex-col items-start', inputWrapperClassName)}
    >
      {label ? (
        <label
          htmlFor={name}
          className={cx('mb-2 text-caption font-bold', labelClassName)}
        >
          {label}
        </label>
      ) : null}

      <input
        type="file"
        name=""
        id=""
        accept={allowedExtensions.join(', ')}
        onChange={(e) => handleFileChange(e, e.target.files)}
      />
      {error && !hideErrorMessage ? (
        <p className="pt-2 text-footnote text-red-200">{t(error)}</p>
      ) : null}
      {description && !error ? (
        <p className="pt-2 text-footnote">{description}</p>
      ) : null}
    </div>
  );
};

export default InputFile;
