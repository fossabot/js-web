import cx from 'classnames';

interface ICheckBox {
  id?: string;
  name: string;
  value?: string | number;
  disabled?: boolean;
  inputClassName?: string;
  onBlur?: (e: any) => void;
  onChange?: (e: any) => void;
  readOnly?: boolean;
  checked?: boolean;
}

const getContainerStyles = (checked) => {
  return checked ? 'border-brand-primary' : 'border-gray-300';
};

const getCheckMarkStyles = (checked) => {
  return checked ? 'bg-transparent' : 'bg-white';
};

const getCheckMarkSignStyles = (checked) => {
  return checked ? 'block' : 'hidden';
};

const RadioButton = ({
  name,
  value,
  onBlur,
  onChange,
  disabled,
  inputClassName,
  readOnly,
  checked,
}: ICheckBox) => {
  return (
    <div
      className={cx(
        'relative inline-block h-4 w-4 overflow-hidden rounded-xl border bg-brand-primary align-middle',
        getContainerStyles(checked),
      )}
    >
      <input
        className={cx(
          'absolute z-10 h-full w-full cursor-pointer opacity-0 disabled:opacity-50',
          inputClassName,
        )}
        type="radio"
        name={name}
        disabled={disabled}
        onChange={onChange}
        onBlur={onBlur}
        value={value}
        readOnly={readOnly}
        checked={checked}
      />
      <div
        className={cx(
          'pointer-events-none relative h-full w-full',
          getCheckMarkStyles(checked),
        )}
      >
        <div
          className={cx(
            'pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rotate-45 transform rounded-xl bg-white',
            getCheckMarkSignStyles(checked),
          )}
        />
      </div>
    </div>
  );
};

export default RadioButton;
