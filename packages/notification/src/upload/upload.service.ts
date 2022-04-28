import { Injectable } from '@nestjs/common';
import sanitizeFilename from 'sanitize-filename';
import {
  convertFileName,
  createPresignedPost,
} from '@seaccentral/core/dist/utils/s3';

@Injectable()
export class UploadService {
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
}
