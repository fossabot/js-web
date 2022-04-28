import {
  BaseMaterial,
  MaterialType,
} from '@seaccentral/core/dist/material/material.entity';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { Expose, Transform } from 'class-transformer';

export class GetMaterialDto extends BaseMaterial {
  @Expose()
  type: MaterialType;

  @Transform(({ value }: { value: User }) => ({
    id: value.id,
    email: value.email,
    firstName: value.firstName,
    lastName: value.lastName,
  }))
  uploader: User;

  constructor(data: BaseMaterial) {
    super();
    Object.assign(this, data);
  }
}
