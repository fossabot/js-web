import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { S3_FILE_UPLOAD_LIMIT } from '@seaccentral/core/dist/utils/constants';
import {
  convertFileName,
  createPresignedPost,
  retrieveObjectFromS3,
  signDirectUploadToS3,
} from '@seaccentral/core/dist/utils/s3';
import sanitizeFilename from 'sanitize-filename';
import { PrepareUploadBody } from './dto/PrepareUploadBody';

@Injectable()
export class UploadService {
  async getS3PresignedUrl(
    prepareUploadBody: PrepareUploadBody,
    allowedExtensions: string[],
    folder: string,
  ) {
    if (
      allowedExtensions.length > 0 &&
      !allowedExtensions.includes(prepareUploadBody.fileType)
    ) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Invalid file type provided',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const sanitizedFilename = sanitizeFilename(
      encodeURIComponent(prepareUploadBody.fileName),
    );

    const result = await signDirectUploadToS3(sanitizedFilename, {
      folder,
      fileType: prepareUploadBody.fileType,
      limit: S3_FILE_UPLOAD_LIMIT,
    });

    return result;
  }

  async getPresignedPostUrl(params: {
    fileName: string;
    folder: string;
    conditions?: Array<{ [key: string]: any } | [string, any, any]>;
    expires?: number;
  }): Promise<AWS.S3.PresignedPost> {
    const { fileName, folder, conditions, expires } = params;
    const key = `${folder}/${convertFileName(sanitizeFilename(fileName))}`;
    const presignedPost = await createPresignedPost({
      Fields: {
        key,
      },
      Expires: expires,
      Conditions: conditions,
    });

    return presignedPost;
  }

  async getUploadedFile(fileName: string, key: string) {
    const buffer = await retrieveObjectFromS3(key);
    return {
      buffer,
      fileName,
    };
  }
}
