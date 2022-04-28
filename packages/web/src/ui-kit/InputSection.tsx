import cx from 'classnames';

import InputField, { InputBehavior, ITextBox } from './InputField';
import useTranslation from '../i18n/useTranslation';

export interface IInputSection {
  formik?: any;
  error?: any;
  label?: string;
  name: string;
  description?: string;
  pattern?: string;
  value?: string | number;
  disabled?: boolean;
  placeholder?: string;
  inputClassName?: string;
  onBlur?: (e: any) => void;
  onChange?: (e: any) => void;
  onFocus?: (e: any) => void;
  type?: string;
  readOnly?: boolean;
  min?: number;
  max?: number;
  step?: number;
  inputWrapperClassName?: string;
  withInlineButtonProps?: ITextBox['withInlineButtonProps'];
  withInlineTextAndIconProps?: {
    text?: string;
    icon?: JSX.Element;
  };
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  inputRef?: React.MutableRefObject<any>;
  behavior?: InputBehavior;
  hideErrorMessage?: boolean;
  labelClassName?: string;
  inputFieldWrapperClassName?: string;
}

const InputSection = (props: IInputSection) => {
  const {
    name,
    error,
    label,
    labelClassName,
    description,
    inputWrapperClassName,
    hideErrorMessage = false,
  } = props;

  const { t } = useTranslation();

  return (
    <div
      className={cx('flex w-full flex-col items-start', inputWrapperClassName)}
    >
      {label ? (
        <label
          htmlFor={name}
          className={cx('mb-2 text-caption font-semibold', labelClassName)}
        >
          {label}
        </label>
      ) : null}

      <InputField {...props} />
      {error && !hideErrorMessage ? (
        <p className="pt-2 text-footnote text-red-200">{t(error)}</p>
      ) : null}
      {description && !error ? (
        <p className="pt-2 text-footnote">{description}</p>
      ) : null}
    </div>
  );
};

export default InputSection;
