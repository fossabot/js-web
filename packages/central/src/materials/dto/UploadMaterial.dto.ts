import { Type } from 'class-transformer';
import { GetMaterialDto } from './GetMaterial.dto';

export class UploadMaterialDto {
  @Type(() => GetMaterialDto)
  material: GetMaterialDto;

  s3Params: {
    url: string;
    fields: Record<string, any>;
  };

  constructor(data: UploadMaterialDto) {
    Object.assign(this, data);
  }
}
