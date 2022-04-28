import * as Yup from 'yup';

export const emailFormatFormSchema = Yup.object().shape({
  formatName: Yup.string().trim().required('required'),
  teamName: Yup.string().trim().required('required'),
  headerImage: Yup.mixed<File | string>().required('required'),
  footerImage: Yup.mixed<File | string>().required('required'),
  footerHTML: Yup.string().optional(),
  copyrightText: Yup.string().required('required'),
  isDefault: Yup.boolean().required('required'),
});

export type EmailFormatFormSchema = Yup.InferType<typeof emailFormatFormSchema>;
