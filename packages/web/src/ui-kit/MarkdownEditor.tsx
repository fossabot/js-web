import 'react-quill/dist/quill.snow.css';

import cx from 'classnames';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';

import useTranslation from '../i18n/useTranslation';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface IProps {
  onChange: (content: string, rawContentCount) => void;
  value: any;
  maxLength?: number;
}

export const MarkdownEditor: React.FC<IProps> = ({
  onChange,
  value,
  maxLength,
}) => {
  const { t } = useTranslation();
  const [count, setCount] = useState(value?.length ?? 0);
  const [textIsTooLong, setTextIsTooLong] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  return (
    <>
      <ReactQuill
        className={'mb-3 max-w-screen-lg'}
        theme="snow"
        value={value}
        onChange={(content, del, src, editor) => {
          // raw text, no html. Can't trim because we should count whitespace as well. But quill generates 1 extra char. So remove it 1.
          const length = editor.getText().length - 1;
          onChange(content, length);
          setCount(length);
          setTextIsTooLong(length > maxLength);
          setIsTouched(true);
        }}
      />
      <p
        className={cx('mt-2 text-caption', {
          'text-red-200': textIsTooLong,
          'text-gray-500': !textIsTooLong,
        })}
      >
        {maxLength &&
          isTouched &&
          t('textAreaCaption', {
            count,
            max: maxLength,
          })}
      </p>
    </>
  );
};
