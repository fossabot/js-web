import dynamic from 'next/dynamic';
import { Language } from '../models/language';

import 'react-quill/dist/quill.snow.css';

import { FormikProps } from 'formik';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export interface IReactQuillWithLangProps {
  name: string;
  formik: FormikProps<any>;
  labelEn?: string;
  labelTh?: string;
  value: Language;
}

export default function ReactQuillWithLang(props: IReactQuillWithLangProps) {
  const handleChange = (
    editor: any,
    name: string,
    formik: FormikProps<any>,
  ) => {
    formik.setFieldValue(name, editor.getText().trim() ? editor.getHTML() : '');
  };

  return (
    <>
      {!!props.labelEn ? (
        <div className="mb-2 text-left">
          <label className="text-caption font-bold">{props.labelEn}</label>
        </div>
      ) : null}
      <ReactQuill
        theme="snow"
        className="mb-3"
        value={props.value?.nameEn || ''}
        onChange={(content, delta, src, editor) =>
          handleChange(editor, `${props.name}.nameEn`, props.formik)
        }
      />
      {!!props.labelTh ? (
        <div className="mb-2 text-left">
          <label className="text-caption font-bold">{props.labelTh}</label>
        </div>
      ) : null}
      <ReactQuill
        theme="snow"
        className="mb-3"
        value={props.value?.nameTh || ''}
        onChange={(content, delta, src, editor) =>
          handleChange(editor, `${props.name}.nameTh`, props.formik)
        }
      />
    </>
  );
}
