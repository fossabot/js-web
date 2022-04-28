import axios from 'axios';
import { sha256 } from 'hash.js';
import API_PATHS from '../../constants/apiPaths';
import { centralHttp } from '../../http';
import { BaseResponseDto } from '../../models/BaseResponse.dto';
import { ICertificate } from '../../models/certificate';
import { ICreateCertificateForm } from './createCertificateForm.schema';

export const getCertificatePayload = async ({
  file,
  ...values
}: ICreateCertificateForm) => {
  const buffer = await file.arrayBuffer();
  return {
    ...values,
    mime: file.type,
    filename: file.name,
    bytes: file.size,
    hash: sha256().update(new Int8Array(buffer)).digest('hex'),
  };
};

export const uploadToS3 = async (
  s3Params: {
    fields: Record<string, any>;
    url: string;
  },
  file: File,
) => {
  const form = new FormData();
  Object.keys(s3Params.fields).forEach((key) =>
    form.append(key, s3Params.fields[key]),
  );
  form.append('Content-Type', file.type);
  form.append('file', file);

  await axios.post(s3Params.url, form);
};

export const getCertificateTemplateUrl = async ({
  id,
}: {
  id: ICertificate['id'];
}) => {
  const url = API_PATHS.CERTIFICATE_DOWNLOAD.replace(':id', id);
  const { data } = await centralHttp.get<BaseResponseDto<string>>(url);
  return data.data;
};
