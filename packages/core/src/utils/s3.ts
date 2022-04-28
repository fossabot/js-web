import * as AWS from 'aws-sdk';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import { sluggerFilter } from './string';

let AWS_S3: AWS.S3;

const isEnabled = process.env.ENABLE_AWS_S3 === 'true';
if (isEnabled) {
  AWS_S3 = new AWS.S3({
    region: process.env.AWS_REGION || 'ap-southeast-1',
  });
}

interface ISignDirectUploadOption {
  folder?: string;
  fileType: string;
  limit: number;
}

const fileNameFilterRegex = /.(?=[^.]*$)/;

export const convertFileName = (fileName: string) => {
  const [name, extension] = fileName
    .split(fileNameFilterRegex)
    .map(sluggerFilter);
  const hash = uuidv4();

  return `${name ? `${name}-` : ''}${hash}${extension ? `.${extension}` : ''}`;
};

export function createPresignedPut(s3Params: {
  Bucket: string;
  Key: string;
  Expires: number;
  ContentType: string;
  ACL: string;
}) {
  return new Promise<string>((resolve, reject) => {
    AWS_S3.getSignedUrl('putObject', s3Params, (error, data) => {
      if (error) {
        return reject(error);
      }

      return resolve(data);
    });
  });
}

export function createPresignedGet(s3Params: {
  Bucket?: string;
  Key: string;
  Expires?: number;
}) {
  return new Promise<string>((resolve, reject) => {
    AWS_S3.getSignedUrl(
      'getObject',
      { Bucket: process.env.S3_MAIN_BUCKET_NAME, ...s3Params },
      (error, data) => {
        if (error) {
          return reject(error);
        }

        return resolve(data);
      },
    );
  });
}

export function createPresignedPost(
  s3Params: AWS.S3.PresignedPost.Params,
): Promise<AWS.S3.PresignedPost> {
  return new Promise((resolve, reject) => {
    AWS_S3.createPresignedPost(
      { Bucket: process.env.S3_MAIN_BUCKET_NAME, ...s3Params },
      (error, data) => {
        if (error) {
          return reject(error);
        }

        return resolve(data);
      },
    );
  });
}

export async function signDirectUploadToS3(
  fileName: string,
  { folder = 'uploads', fileType }: ISignDirectUploadOption,
) {
  const bucket = process.env.S3_MAIN_BUCKET_NAME || '';
  const key = `${folder}/${convertFileName(fileName)}`;

  const s3Params = {
    Bucket: bucket,
    Key: key,
    Expires: 60,
    ContentType: fileType,
    ACL: 'private',
  };

  const result = await createPresignedPut(s3Params);

  return {
    key,
    url: result,
  };
}

export async function retrieveStreamObject(key: string) {
  const s3Params = {
    Bucket: process.env.S3_MAIN_BUCKET_NAME || '',
    Key: key,
  };
  return AWS_S3.getObject(s3Params).createReadStream();
}

export async function retrieveObjectFromS3(key: string) {
  const s3Params = {
    Bucket: process.env.S3_MAIN_BUCKET_NAME || '',
    Key: key,
  };

  try {
    const data = await AWS_S3.getObject(s3Params).promise();
    return data.Body as Blob | Buffer;
  } catch (error) {
    throw new Error('error');
  }
}

export async function deleteObjectFromS3(key: string) {
  const s3Params = {
    Bucket: process.env.S3_MAIN_BUCKET_NAME || '',
    Key: key,
  };

  return AWS_S3.deleteObject(s3Params).promise();
}

export async function uploadObjectToS3(
  key: string,
  data: Buffer | Blob | Readable,
) {
  const s3Params = {
    Bucket: process.env.S3_MAIN_BUCKET_NAME || '',
    Key: key,
    Body: data,
    ACL: 'private',
  };

  return AWS_S3.upload(s3Params).promise();
}

export async function moveObjectOnS3(
  sourceKey: string,
  toKey: string,
  sourceBucket: string = process.env.S3_MAIN_BUCKET_NAME || '',
  toBucket: string = process.env.S3_MAIN_BUCKET_NAME || '',
) {
  const s3Params = {
    CopySource: `${sourceBucket}/${sourceKey}`,
    Bucket: toBucket,
    Key: toKey,
  };

  await AWS_S3.copyObject(s3Params).promise();

  await deleteObjectFromS3(sourceKey);
}
