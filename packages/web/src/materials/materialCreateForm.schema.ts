import * as Yup from 'yup';
import bytes from 'bytes';
import { MaterialType } from '../models/baseMaterial';

export interface IMaterialCreateForm {
  displayName?: string;
  language?: string;
  file: File;
  materialType: MaterialType;
  url: string;
}

export const materialCreateFormSchema = Yup.object({
  file: Yup.mixed().when('materialType', {
    is: MaterialType.MATERIAL_INTERNAL,
    then: Yup.mixed()
      .required('Required')
      .test(
        'fileSize',
        'This file exceeds 30 MB',
        (value: File) => value?.size <= bytes.parse('30 MB'),
      ),
  }),
  url: Yup.string().when('materialType', {
    is: MaterialType.MATERIAL_EXTERNAL,
    then: Yup.string().url().trim().required('Required'),
  }),
});
