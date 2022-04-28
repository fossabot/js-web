import { Dispatch, FC } from 'react';
import { CloudUpload, ProgressCircle } from './icons';
import classNames from 'classnames';
import FileUploadButton from './FileUploadButton';
import { isNumber } from 'lodash';

export interface IImageUpload {
  onChange: Dispatch<React.ChangeEvent<HTMLInputElement>>;
  name: string;
  previewSrc?: string;
  percent?: number;
  className?: string;
  accept?: string;
}

export const ImageUpload: FC<IImageUpload> = (props) => {
  const { onChange, previewSrc, className, accept, name, percent } = props;
  const loading = isNumber(percent);

  async function handleOnChange(evt: React.ChangeEvent<HTMLInputElement>) {
    onChange({
      ...evt,
      target: {
        ...evt.target,
        files: evt.target.files,
        name,
        value: evt.target.files[0] as any,
      },
    });
  }

  if (!previewSrc) {
    return (
      <FileUploadButton
        name={name}
        variant="secondary"
        btnText="Upload"
        className="p-4"
        onChange={handleOnChange}
        accept={accept}
      />
    );
  }

  return (
    <label
      className={classNames('relative block max-w-max', className, {
        'cursor-pointer': !loading,
      })}
    >
      <img src={previewSrc} />
      {!loading && (
        <input
          name={name}
          className="hidden"
          type="file"
          accept={accept}
          onChange={handleOnChange}
        />
      )}
      {loading ? (
        <div className="absolute inset-0 m-auto flex h-full w-full items-center justify-center bg-black text-title-desktop font-bold text-white opacity-0 hover:opacity-70">
          <ProgressCircle className="h-12 w-12" percentage={percent} />
        </div>
      ) : (
        <div className="absolute inset-0 m-auto flex h-full w-full items-center justify-center bg-black text-title-desktop font-bold text-white opacity-0 hover:opacity-70">
          <CloudUpload className="h-12 w-12" />
        </div>
      )}
    </label>
  );
};
