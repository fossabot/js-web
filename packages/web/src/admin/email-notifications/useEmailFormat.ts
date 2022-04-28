import API_PATHS from '../../constants/apiPaths';
import { EMAIL_FORMAT_PREVIEW } from '../../constants/localstorage';
import WEB_PATHS from '../../constants/webPaths';
import { notificationHttp } from '../../http';
import { AwsPresignedPost } from '../../models/awsPresignedPost';
import { BaseResponseDto } from '../../models/BaseResponse.dto';
import { s3PresignedPostPayload } from '../../utils/s3';
import { EmailFormatFormSchema } from './emailFormatForm.schema';
import axios from 'axios';
import config from '../../config';

export function useEmailFormat() {
  async function createEmailFormat(values: EmailFormatFormSchema) {
    const { headerImage, footerImage, ...rest } = values;

    const [s3Header, s3Footer] = await Promise.all([
      uploadEmailFormatImage(headerImage as File),
      uploadEmailFormatImage(footerImage as File),
    ]);

    await notificationHttp.post(API_PATHS.EMAIL_FORMAT, {
      ...rest,
      headerImageKey: s3Header.fields.key,
      footerImageKey: s3Footer.fields.key,
    });
  }

  async function editEmailFormat(id: string, values: EmailFormatFormSchema) {
    const { headerImage, footerImage, ...rest } = values;
    const headerImageKey =
      typeof headerImage === 'object'
        ? (await uploadEmailFormatImage(headerImage)).fields.key
        : headerImage;
    const footerImageKey =
      typeof footerImage === 'object'
        ? (await uploadEmailFormatImage(footerImage)).fields.key
        : footerImage;

    await notificationHttp.post(API_PATHS.EMAIL_FORMAT, {
      ...rest,
      id,
      headerImageKey,
      footerImageKey,
    });
  }

  async function removeEmailFormat(id: string) {
    const res = await notificationHttp.delete<BaseResponseDto<any>>(
      API_PATHS.EMAIL_FORMAT_ID.replace(':id', id),
    );

    return res.data.data;
  }

  async function uploadEmailFormatImage(file: File) {
    const { data } = await notificationHttp.post<
      BaseResponseDto<AwsPresignedPost>
    >(API_PATHS.EMAIL_FORMAT_IMAGE);
    const awsPresignedPost = data.data;
    const payload = s3PresignedPostPayload(file, awsPresignedPost);
    await axios.post(awsPresignedPost.url, payload);

    return awsPresignedPost;
  }

  async function previewEmailFormat(values: EmailFormatFormSchema) {
    const {
      formatName,
      teamName,
      headerImage,
      footerImage,
      footerHTML,
      copyrightText,
    } = values;
    const [_headerImage, _footerImage] = await Promise.all([
      getImageSource(headerImage),
      getImageSource(footerImage),
    ]);

    const payload = {
      formatName,
      teamName,
      headerImage: _headerImage,
      footerImage: _footerImage,
      footerHTML,
      copyrightText,
    };
    window.localStorage.setItem(EMAIL_FORMAT_PREVIEW, JSON.stringify(payload));
    window.open(WEB_PATHS.EMAIL_FORMAT_PREVIEW, '_blank');
  }

  function getImageSource(image: File | string) {
    if (typeof image === 'object') {
      return fileToBase64(image);
    } else if (typeof image === 'string' && image !== '') {
      return Promise.resolve(`${config.CDN_BASE_URL}/${image}`);
    }

    return null;
  }

  function fileToBase64(blob: Blob) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function () {
        resolve(reader.result.toString());
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  return {
    createEmailFormat,
    previewEmailFormat,
    editEmailFormat,
    removeEmailFormat,
  };
}
