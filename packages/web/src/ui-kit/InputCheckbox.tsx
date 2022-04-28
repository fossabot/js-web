import cx from 'classnames';
import CheckBox from './CheckBox';
import useTranslation from '../i18n/useTranslation';

const InputCheckbox = (props: {
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
}) => {
  const { t } = useTranslation();
  const { error, label, inputWrapperClassName } = props;
  return (
    <div className={cx('flex flex-col items-start', inputWrapperClassName)}>
      <label className="flex w-full items-center text-left text-caption">
        <CheckBox type="square" {...props} />
        <span className="pl-2">{label}</span>
      </label>
      {error && <p className="pt-2 text-footnote text-red-200">{t(error)}</p>}
    </div>
  );
};

export default InputCheckbox;
