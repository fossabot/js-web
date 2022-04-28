import bytes from 'bytes';
import * as Yup from 'yup';

export interface VideoCreateFormValue {
  title: string;
  description: string;
  file: File;
}

export const videoCreateFormSchema = Yup.object({
  title: Yup.string().trim().required('Required'),
  file: Yup.mixed()
    .required('Required')
    .test(
      'fileSize',
      'This file exceeds 5 GB',
      (value: File) => value?.size <= bytes.parse('5 GB'),
    ),
});

export const videoEditFormSchema = Yup.object({
  title: Yup.string().trim().required('Required'),
  file: Yup.mixed()
    .nullable()
    .test(
      'fileSize',
      'This file exceeds 5 GB',
      (value: File) => !value || value.size <= bytes.parse('5 GB'),
    ),
});
