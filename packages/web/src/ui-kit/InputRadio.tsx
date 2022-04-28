import cx from 'classnames';
import RadioButton from './RadioButton';
import useTranslation from '../i18n/useTranslation';

interface IInputRadio {
  formik?: any;
  name: string;
  error?: any;
  value?: string | number;
  label?: string;
  disabled?: boolean;
  inputClassName?: string;
  onBlur?: (e: any) => void;
  onChange?: (e: any) => void;
  inputWrapperClassName?: string;
  readOnly?: boolean;
  checked?: boolean;
}

const InputRadio = (props: IInputRadio) => {
  const { t } = useTranslation();
  const { error, label, inputWrapperClassName, disabled } = props;
  return (
    <div className={cx('flex flex-col items-start', inputWrapperClassName)}>
      <label
        className={cx(
          'flex w-full cursor-pointer items-center space-x-3 rounded-xl border border-gray-300 px-4 py-2',
          {
            'cursor-not-allowed bg-gray-200 text-gray-400': disabled,
          },
        )}
      >
        <RadioButton {...props} />
        <span>{label}</span>
      </label>
      {error && <p className="pt-2 text-footnote text-red-200">{t(error)}</p>}
    </div>
  );
};

export default InputRadio;
