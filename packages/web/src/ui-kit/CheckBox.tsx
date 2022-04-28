import cx from 'classnames';

interface ICheckBox {
  name: string;
  value?: string | number;
  disabled?: boolean;
  inputClassName?: string;
  onBlur?: (e: any) => void;
  onChange?: (e: any) => void;
  readOnly?: boolean;
  checked?: boolean;
  type: 'square' | 'round';
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

const CheckBox = ({
  name,
  value,
  onBlur,
  onChange,
  disabled,
  inputClassName,
  readOnly,
  checked,
  type,
}: ICheckBox) => {
  return (
    <div
      className={cx(
        'relative inline-block h-4 w-4 flex-shrink-0 overflow-hidden rounded border bg-brand-primary align-middle',
        getContainerStyles(checked),
        type === 'square' ? 'rounded' : 'rounded-2xl',
      )}
    >
      <input
        className={cx(
          'absolute z-10 h-full w-full opacity-0 disabled:opacity-50',
          inputClassName,
        )}
        type="checkbox"
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
            'pointer-events-none absolute left-1/2 top-1/2 h-2 w-1 -translate-x-1/2 -translate-y-1/2 rotate-45 transform border-r-2 border-b-2 border-white',
            getCheckMarkSignStyles(checked),
          )}
          style={{ marginTop: '-1px' }}
        />
      </div>
    </div>
  );
};

export default CheckBox;
