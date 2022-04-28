import cx from 'classnames';
import { MutableRefObject, useState } from 'react';
import { Eye, EyeSlash } from './icons';

export enum InputBehavior {
  password = 'password',
}

export interface ITextBox {
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
  withInlineButtonProps?: {
    text: React.ReactNode;
    buttonProps?: React.DetailedHTMLProps<
      React.ButtonHTMLAttributes<HTMLButtonElement>,
      HTMLButtonElement
    >;
    loading?: boolean;
    backgroundColorClassName?: string;
  };
  withInlineTextAndIconProps?: {
    text?: string;
    icon?: JSX.Element;
  };
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  inputRef?: MutableRefObject<any>;
  behavior?: InputBehavior;
  inputFieldWrapperClassName?: string;
  autoFocus?: boolean;
}

const InputField = ({
  name,
  value,
  error,
  onBlur,
  onChange,
  onFocus,
  disabled,
  pattern,
  placeholder,
  inputClassName,
  readOnly,
  type = 'text',
  withInlineButtonProps,
  withInlineTextAndIconProps,
  iconLeft,
  iconRight,
  min,
  max,
  step,
  inputRef,
  behavior,
  inputFieldWrapperClassName,
  autoFocus,
}: ITextBox) => {
  const [show, setShow] = useState(false);
  const [focus, setFocus] = useState(false);

  return (
    <div
      className={cx(
        'input-field-wrapper relative w-full',
        inputFieldWrapperClassName,
      )}
    >
      {iconLeft && (
        <div
          className={cx(
            'absolute top-1/2 left-4 -translate-y-1/2 transform text-body',
            { 'text-red-200': error },
          )}
        >
          {iconLeft}
        </div>
      )}
      {iconRight && (
        <div
          className={cx(
            'absolute top-1/2 right-4 -translate-y-1/2 transform text-body',
            { 'text-red-200': error },
          )}
        >
          {iconRight}
        </div>
      )}
      {behavior === InputBehavior.password && (
        <div
          className={cx(
            'absolute top-1/2 right-4 z-10 -translate-y-1/2 transform text-body text-gray-400',
          )}
        >
          <EyeSlash
            className={cx(`h-5 w-5 cursor-pointer ${show ? 'hidden' : ''}`, {
              'text-red-200 hover:text-red-300': error,
              'text-gray-500': !error && focus,
              'hover:text-gray-600': !error,
            })}
            onClick={() => setShow(true)}
          />
          <Eye
            className={cx(`h-5 w-5 cursor-pointer ${show ? '' : 'hidden'}`, {
              'text-red-200 hover:text-red-300': error,
              'text-gray-500': !error && focus,
              'hover:text-gray-600': !error,
            })}
            onClick={() => setShow(false)}
          />
        </div>
      )}
      {withInlineTextAndIconProps && (
        <div className="absolute inset-y-0 right-0 flex items-center py-2 pl-10 pr-4 text-caption font-regular text-green-200">
          {withInlineTextAndIconProps.icon}
          <span className="pl-2 font-semibold">
            {withInlineTextAndIconProps.text}
          </span>
        </div>
      )}
      <input
        className={cx(
          'outline-none z-0 w-full rounded-lg border bg-white px-4 py-2 text-body disabled:opacity-50',
          inputClassName,
          iconLeft && 'pl-12',
          iconRight && 'pr-12',
          behavior === InputBehavior.password && 'pr-10',
          withInlineTextAndIconProps && 'pr-24',
          withInlineButtonProps && 'pr-27',
          {
            'border-red-200': error,
            'focus:border-red-200': error,
            'border-gray-300': !error,
            'focus:border-gray-500': !error,
          },
        )}
        type={
          behavior === InputBehavior.password
            ? show
              ? 'text'
              : 'password'
            : type
        }
        name={name}
        disabled={disabled}
        autoComplete="off"
        placeholder={placeholder}
        onChange={onChange}
        onBlur={(e) => {
          setFocus(false);
          onBlur && onBlur(e);
        }}
        onFocus={(e) => {
          onFocus && onFocus(e);
          setFocus(true);
        }}
        value={value}
        readOnly={readOnly}
        pattern={pattern}
        min={min}
        max={max}
        step={step}
        ref={inputRef}
        autoFocus={autoFocus}
      />
      {withInlineButtonProps && (
        <button
          {...withInlineButtonProps.buttonProps}
          disabled={withInlineButtonProps?.buttonProps?.disabled || disabled}
          className={cx(
            'outline-none focus:outline-none absolute inset-y-0 right-0 flex items-center rounded-r-lg border px-7 py-2.5 text-caption font-semibold focus:ring-gray-500 disabled:opacity-50',
            withInlineButtonProps.buttonProps?.className,
            {
              'bg-gray-200': withInlineButtonProps.loading,
            },
            withInlineButtonProps.backgroundColorClassName || 'bg-gray-200',
            {
              'border-red-200': error,
              'focus:border-red-300': error,
              'border-gray-300': !error,
              'focus:border-gray-500': !error,
            },
          )}
        >
          {withInlineButtonProps.loading ? (
            <div className="loader h-5 w-5 animate-spin rounded-full border-4 border-gray-500" />
          ) : (
            withInlineButtonProps.text
          )}
        </button>
      )}
    </div>
  );
};

export default InputField;
