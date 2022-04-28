import { FC } from 'react';
import cx from 'classnames';
import { CloudUpload } from './icons';
import config from '../config';

interface IFileUploadButton {
  variant: 'primary' | 'secondary' | 'ghost';
  btnText: string;
  className?: string;
  isLoading?: boolean;
  [x: string]: any;
}

const FileUploadButton: FC<IFileUploadButton> = ({
  variant,
  className,
  btnText,
  ...props
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return 'bg-brand-primary border-brand-primary active:bg-maroon-600 active:border-maroon-600 text-white disabled:bg-gray-200 disabled:border-gray-200';
      case 'secondary':
        return 'bg-gray-100 border-gray-300 active:bg-gray-200 active:border-gray-700 text-black disabled:bg-gray-200 disabled:border-gray-200 focus:border-gray-200';
      case 'ghost':
        return 'bg-transparent border-transparent active:bg-maroon-200 text-brand-primary disabled:bg-transparent';
    }
  };

  return (
    <label
      className={cx(
        className,
        `outline-none focus:outline-none flex w-full flex-row items-center justify-center rounded-lg border transition-colors disabled:border-gray-200 disabled:bg-gray-200`,
        'cursor-pointer py-2 px-20px text-base focus-visible:ring-4 focus-visible:ring-brand-primary focus-visible:ring-offset-3',
        getVariantStyle(),
      )}
    >
      <CloudUpload className="text-grey-400 mr-2 h-5 w-5" aria-hidden="true" />
      <span>{btnText}</span>
      <input type="file" className="hidden" {...props} />
    </label>
  );
};

export default FileUploadButton;
