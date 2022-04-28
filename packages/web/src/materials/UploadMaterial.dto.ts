import { AwsPresignedPost } from '../models/awsPresignedPost';
import { GetMaterialDto } from './GetMaterial.dto';

export interface UploadMaterialDto {
  material: GetMaterialDto;
  s3Params: AwsPresignedPost;
}
