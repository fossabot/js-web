import cx from 'classnames';
import { FaCloudUploadAlt } from 'react-icons/fa';
import useTranslation from '../i18n/useTranslation';

const FileUpload = ({
  label,
  name,
  value,
  error,
  accept,
  onChange,
  isExisting,
  inputWrapperClassName,
}: {
  label: string;
  name: string;
  error?: any;
  value?: string;
  accept?: string[];
  isExisting?: boolean;
  onChange?: (e: any) => void;
  inputWrapperClassName?: string;
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={cx('flex w-full flex-col items-start', inputWrapperClassName)}
    >
      <label className="flex w-1/2 cursor-pointer flex-col items-center rounded border border-blue-500 bg-white px-3 py-3 uppercase text-blue-500 hover:bg-blue-500 hover:text-white">
        <FaCloudUploadAlt className="text-2xl" />
        <span className="mt-2 text-base leading-normal">{label}</span>
        <input
          type="file"
          name={name}
          className="hidden"
          onChange={onChange}
          accept={accept.join(',')}
        />
      </label>
      {value ? (
        <p
          className={cx('mt-2 w-1/2 truncate p-2 text-left text-white', {
            'bg-green-200': isExisting,
            'bg-gray-400': !isExisting,
          })}
          title={value}
        >
          {value}
        </p>
      ) : null}
      {error ? <p className="pt-0.5 text-xs text-red-200">{t(error)}</p> : null}
    </div>
  );
};

export default FileUpload;
