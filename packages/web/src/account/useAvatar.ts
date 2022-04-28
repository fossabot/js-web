import axios from 'axios';
import { useState } from 'react';
import { Area } from 'react-easy-crop/types';
import API_PATHS from '../constants/apiPaths';
import { centralHttp } from '../http';
import { AwsPresignedPost } from '../models/awsPresignedPost';
import { BaseResponseDto } from '../models/BaseResponse.dto';

export function useAvatar() {
  const [preview, setPreview] = useState<string>();
  const [uploading, setUploading] = useState<boolean>(false);

  async function upload(blob: Blob) {
    setUploading(true);
    const response = await centralHttp.post<BaseResponseDto<AwsPresignedPost>>(
      API_PATHS.PROFILE_AVATAR,
    );
    const { url, fields } = response.data.data;
    const form = new FormData();
    Object.keys(fields).forEach((key) => form.append(key, fields[key]));
    form.append('Content-Type', blob.type);
    form.append('file', blob);

    await axios.post(url, form);
    setUploading(false);
  }

  async function crop(pixelCrop: Area) {
    const blob: Blob = await getCroppedImg(preview, pixelCrop);

    return blob;
  }

  async function resize(blob: Blob, width: number, height: number) {
    const imageSrc = URL.createObjectURL(blob);
    const result = await resizeImage(imageSrc, width, height);
    URL.revokeObjectURL(imageSrc);

    return result;
  }

  return { preview, setPreview, crop, resize, upload, uploading };
}

function createImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });
}

/**
 * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
 * @param {File} image - Image File url
 * @param {Object} pixelCrop - pixelCrop Object provided by react-easy-crop
 * @param {number} rotation - optional rotation parameter
 */
async function getCroppedImg(imageSrc: string, pixelCrop: Area, rotation = 0) {
  const image = await createImage(imageSrc);

  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  const pixelRatio = window.devicePixelRatio;
  canvas.width = pixelCrop.width * pixelRatio;
  canvas.height = pixelCrop.height * pixelRatio;

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  const ctx = canvas.getContext('2d');
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    image,
    pixelCrop.x * scaleX,
    pixelCrop.y * scaleY,
    pixelCrop.width * scaleX,
    pixelCrop.height * scaleY,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise<Blob>((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg');
  });
}

async function resizeImage(imageSrc: string, width: number, height: number) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height);
  return new Promise<Blob>((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg');
  });
}
