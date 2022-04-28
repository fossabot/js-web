/* eslint-disable max-classes-per-file */

import { ApiProperty, PickType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Base } from '../base/Base.entity';

export class BaseEntityFullDto extends Base {
  @Expose()
  @ApiProperty({ format: 'uuid' })
  id: string;

  @Expose()
  @ApiProperty()
  isActive: boolean;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}

export class BaseEntityDto extends PickType(BaseEntityFullDto, [
  'id',
] as const) {}
