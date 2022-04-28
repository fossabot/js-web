import { AxiosInstance } from 'axios';
import { FormikProps } from 'formik';
import { ChangeEvent, useState } from 'react';

import fileUploadToS3 from './fileUploadToS3';

export default function useUpload() {
  const [file, setFile] = useState(null);

  async function upload(path: string, http: AxiosInstance) {
    if (file) {
      const response = await fileUploadToS3(path, file, http);

      return response.key;
    }

    return null;
  }

  function saveToState(
    e: ChangeEvent<HTMLInputElement>,
    formik: FormikProps<any>,
  ) {
    e.preventDefault();
    const fieldName = e.target.name;
    const selectedFile = e.target && e.target.files && e.target.files[0];

    if (!selectedFile) {
      return;
    }

    setFile(selectedFile);

    formik.setFieldValue(fieldName, selectedFile.name);
  }

  return { file, saveToState, upload };
}
