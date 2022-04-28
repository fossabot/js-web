import * as Yup from 'yup';
import bytes from 'bytes';
import {
  CertificationType,
  CertificationOrientation,
} from '../../models/certificate';

export interface ICreateCertificateForm {
  title: string;
  file: File;
  orientation: CertificationOrientation;
  certType: CertificationType | null;
  provider: string;
}

export const createCertificateFormSchema = Yup.object({
  title: Yup.string().required('certificateForm.required'),

  provider: Yup.string().required('certificateForm.required'),
  file: Yup.mixed()
    .required('certificateForm.required')
    .test(
      'fileSize',
      'certificateForm.exceeds30MB',
      (value: File) => value?.size <= bytes.parse('30 MB'),
    ),
});
