import { Language } from '../models/language';
import InputSection from './InputSection';

export interface ILangInputSectionProps {
  formik?: any;
  labelEn?: string;
  labelTh?: string;
  name: string;
  value: Language;
  placeholder?: string;
  formikTouched?: any;
  formikErrors?: any;
  [key: string]: any;
}

export default function LangInputSection(props: ILangInputSectionProps) {
  return (
    <>
      <InputSection
        {...props}
        label={props.labelEn}
        name={`${props.name}.nameEn`}
        placeholder={props.placeholder}
        value={props.value?.nameEn}
        error={props.formikTouched?.nameEn && props.formikErrors?.nameEn}
      />
      <InputSection
        {...props}
        label={props.labelTh}
        name={`${props.name}.nameTh`}
        placeholder={props.placeholder}
        value={props.value?.nameTh}
        error={props.formikTouched?.nameTh && props.formikErrors?.nameTh}
      />
    </>
  );
}
