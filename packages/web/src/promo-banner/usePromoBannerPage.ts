import axios from 'axios';
import { FormikHelpers } from 'formik';
import API_PATHS from '../constants/apiPaths';
import { centralHttp } from '../http';
import { AwsPresignedPost } from '../models/awsPresignedPost';
import { BaseResponseDto } from '../models/BaseResponse.dto';
import { Banner, COLOR, PromoBannerFormValues } from './promoBanner.schema';
import { omitBy } from 'lodash';
import { PromoBanner } from '../models/promoBanner';
import { useState } from 'react';
import { useToasts } from 'react-toast-notifications';

export function usePromoBannerPage() {
  const [promoBanners, setPromoBanners] = useState<PromoBanner[]>();
  const { addToast } = useToasts();

  async function fetchBanners() {
    const { data } = await centralHttp.get<BaseResponseDto<PromoBanner[]>>(
      API_PATHS.PROMO_BANNER,
    );
    setPromoBanners(data.data);
    return data.data;
  }

  async function uploadImageToS3(
    values: PromoBannerFormValues,
    helpers: FormikHelpers<PromoBannerFormValues>,
  ) {
    const { banners } = values;
    const bannerPromises = banners.map(async (banner, index) => {
      const bannerPayload: Partial<Banner> = {
        ...omitBy(banner, (value) => value === ''),
        overlayColor:
          banner.overlayColor === COLOR.NONE ? null : banner.overlayColor,
        percent: undefined,
      };
      if (!banner.assetKey.includes('blob')) {
        return bannerPayload;
      }
      const { data: blob } = await axios.get(banner.assetKey, {
        responseType: 'blob',
      });
      const response = await centralHttp.post<
        BaseResponseDto<AwsPresignedPost>
      >(API_PATHS.PROMO_BANNER_UPLOAD);
      const { url, fields } = response.data.data;
      const form = new FormData();

      Object.keys(fields).forEach((key) => form.append(key, fields[key]));
      form.append('file', blob);
      await axios.post(url, form, {
        onUploadProgress: (data) => {
          helpers.setFieldValue(
            `banners.${index}.percent`,
            (data.loaded / data.total) * 100,
          );
        },
      });

      return {
        ...bannerPayload,
        assetKey: fields.key,
      };
    });
    return Promise.allSettled(bannerPromises);
  }

  async function handleSubmit(
    values: PromoBannerFormValues,
    helpers: FormikHelpers<PromoBannerFormValues>,
  ) {
    const results = await uploadImageToS3(values, helpers);
    const banners = results.map((result, index) =>
      result.status === 'fulfilled'
        ? { ...result.value }
        : values.banners[index],
    );
    const { data } = await centralHttp.post<BaseResponseDto<PromoBanner[]>>(
      API_PATHS.PROMO_BANNER,
      {
        banners,
      },
    );
    setPromoBanners(data.data);
    addToast('Saved successfully', { appearance: 'success' });
  }

  return {
    promoBanners,
    handleSubmit,
    fetchBanners,
  };
}
