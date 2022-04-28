import API_PATHS from '../constants/apiPaths';
import { centralHttp } from '../http';
import { AwsPresignedPost } from '../models/awsPresignedPost';
import { BaseResponseDto } from '../models/BaseResponse.dto';
import { IMaterialCreateForm } from './materialCreateForm.schema';
import axios from 'axios';
import { defaultTo, identity, pickBy } from 'lodash';
import { UploadMaterialDto } from './UploadMaterial.dto';
import { GetMaterialDto } from './GetMaterial.dto';
import {
  BaseMaterial,
  MaterialExternal,
  MaterialInternal,
  MaterialType,
} from '../models/baseMaterial';
import { sha256 } from 'hash.js';

export function useMaterialForm() {
  async function makeInternalMaterialPayload(values: IMaterialCreateForm) {
    const { displayName, language } = pickBy(values, identity);
    const { file } = values;
    const buffer = await file.arrayBuffer();
    return {
      type: MaterialType.MATERIAL_INTERNAL,
      displayName: defaultTo(displayName, file.name),
      language,
      mime: file.type,
      filename: file.name,
      bytes: file.size,
      hash: sha256().update(new Int8Array(buffer)).digest('hex'),
    };
  }

  async function createInternalMaterial(values: IMaterialCreateForm) {
    const payload = await makeInternalMaterialPayload(values);
    const response = await centralHttp.post<BaseResponseDto<UploadMaterialDto>>(
      API_PATHS.MATERIALS,
      payload,
    );
    const { data } = response.data;
    await uploadToS3(data.s3Params, values.file);

    return data;
  }

  async function updateInternalMaterial(
    values: IMaterialCreateForm,
    material: MaterialInternal,
  ) {
    const { file } = values;
    const endpoint = API_PATHS.MATERIALS_ID.replace(':id', material.id);
    const noopFile: File = {
      lastModified: 0,
      name: material.filename,
      size: material.bytes,
      type: material.mime,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      slice: () => null,
      text: () => Promise.resolve(''),
      stream: null,
      webkitRelativePath: null,
    };
    const originalFilePayload = {
      mime: material.mime,
      filename: material.filename,
      bytes: material.bytes,
      hash: material.hash,
    };

    if (!file) {
      const payload = await makeInternalMaterialPayload({
        ...values,
        file: noopFile,
      });
      await centralHttp.post<BaseResponseDto<Record<string, any>>>(endpoint, {
        ...payload,
        ...originalFilePayload,
      });
      return;
    }

    const payload = await makeInternalMaterialPayload(values);
    const isSameFile = payload.hash === material.hash;
    if (isSameFile) {
      await centralHttp.post<BaseResponseDto<Record<string, any>>>(endpoint, {
        ...payload,
        ...originalFilePayload,
      });
    } else {
      const response = await centralHttp.post<
        BaseResponseDto<UploadMaterialDto>
      >(endpoint, payload);
      const { s3Params } = response.data.data;
      await uploadToS3(s3Params, file);
    }
  }

  function makeExternalMaterialPayload(values: IMaterialCreateForm) {
    const { displayName, language } = pickBy(values, identity);
    const { url } = values;
    return {
      type: MaterialType.MATERIAL_EXTERNAL,
      displayName: defaultTo(displayName, url),
      language,
      url,
    };
  }

  async function createExternalMaterial(values: IMaterialCreateForm) {
    const response = await centralHttp.post<BaseResponseDto<GetMaterialDto>>(
      API_PATHS.MATERIALS,
      makeExternalMaterialPayload(values),
    );

    return response.data.data;
  }

  async function updateExternalMaterial(
    values: IMaterialCreateForm,
    material: MaterialExternal,
  ) {
    const response = await centralHttp.post<
      BaseResponseDto<Record<string, any>>
    >(
      API_PATHS.MATERIALS_ID.replace(':id', material.id),
      makeExternalMaterialPayload(values),
    );

    return response.data.data;
  }

  async function uploadToS3(params: AwsPresignedPost, file: File) {
    const { url, fields } = params;
    const form = new FormData();
    Object.keys(fields).forEach((key) => form.append(key, fields[key]));
    form.append('Content-Type', file.type);
    form.append('file', file);

    return await axios.post(url, form);
  }

  async function handleSubmitCreate(values: IMaterialCreateForm) {
    if (values.materialType === MaterialType.MATERIAL_EXTERNAL) {
      await createExternalMaterial(values);
    } else {
      await createInternalMaterial(values);
    }
  }

  async function handleSubmitUpdate(
    values: IMaterialCreateForm,
    material: BaseMaterial,
  ) {
    if (values.materialType === MaterialType.MATERIAL_INTERNAL) {
      await updateInternalMaterial(values, material as MaterialInternal);
    } else {
      await updateExternalMaterial(values, material as MaterialExternal);
    }
  }

  return { handleSubmitCreate, handleSubmitUpdate };
}
