import { FC } from 'react';
import cx from 'classnames';
import useTranslation from '../i18n/useTranslation';
import { ChangeEventHandler } from 'react';

interface IInputTextArea {
  label?: string;
  name: string;
  error?: string;
  inputWrapperClassName?: string;
  description?: string;
  textareaProps?: React.DetailedHTMLProps<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    HTMLTextAreaElement
  >;
  onBlur?: ChangeEventHandler<HTMLTextAreaElement>;
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
  value?: string;
}

const InputTextArea: FC<IInputTextArea> = ({
  label,
  name,
  error,
  inputWrapperClassName,
  description,
  textareaProps,
  onBlur,
  onChange,
  value,
}) => {
  const { t } = useTranslation();
  const { className, ...textareaPropsRest } = textareaProps;

  return (
    <div className={cx('flex w-full flex-col py-1', inputWrapperClassName)}>
      {label && (
        <label
          htmlFor={name}
          className="mb-2 w-full text-caption font-semibold"
        >
          {label}
        </label>
      )}
      <textarea
        className={cx(
          'outline-none  z-0 rounded-lg border bg-white px-4 py-2 text-body disabled:opacity-50',
          {
            'border-red-200': error,
            'focus:border-red-200': error,
            'border-gray-300': !error,
            'focus:border-gray-500': !error,
          },
          className,
        )}
        {...{ onBlur, onChange, value }}
        {...textareaPropsRest}
        name={name}
      />
      {error ? (
        <p className="w-full pt-2 text-footnote text-red-200">{t(error)}</p>
      ) : null}
      {description && !error ? (
        <p className="w-full pt-2 text-footnote text-gray-500">{description}</p>
      ) : null}
    </div>
  );
};

export default InputTextArea;
