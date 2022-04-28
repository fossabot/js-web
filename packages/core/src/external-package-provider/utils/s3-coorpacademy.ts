import * as AWS from 'aws-sdk';

let AWS_S3: AWS.S3;

const isEnabled = process.env.ENABLE_COORPACADEMY_AWS_S3 === 'true';
if (isEnabled) {
  AWS_S3 = new AWS.S3({
    region: process.env.COORPACADEMY_S3_AWS_REGION || 'eu-west-1',
    accessKeyId: process.env.COORPACADEMY_S3_ACCESS_KEY,
    secretAccessKey: process.env.COORPACADEMY_S3_SECRET_KEY,
  });
}

export async function retrieveStreamObject(key: string) {
  const s3Params = {
    Bucket: process.env.COORPACADEMY_S3_BUCKET_NAME || '',
    Key: key,
  };
  return AWS_S3.getObject(s3Params).createReadStream();
}

export async function retrieveObjectFromS3(key: string) {
  const s3Params = {
    Bucket: process.env.COORPACADEMY_S3_BUCKET_NAME || '',
    Key: key,
  };

  try {
    const data = await AWS_S3.getObject(s3Params).promise();
    return data.Body as Blob | Buffer;
  } catch (error) {
    throw new Error(error);
  }
}
