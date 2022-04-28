import { AwsPresignedPost } from '../models/awsPresignedPost';

export function s3PresignedPostPayload(
  file: File | Blob,
  awsPresignedPost: AwsPresignedPost,
) {
  const { fields } = awsPresignedPost;
  const form = new FormData();
  Object.keys(fields).forEach((key) => form.append(key, fields[key]));
  form.append('Content-Type', file.type);
  form.append('file', file);

  return form;
}
