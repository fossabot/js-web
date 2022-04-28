import { MaterialType } from '@seaccentral/core/dist/material/material.entity';
import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import { IsEnum, IsOptional } from 'class-validator';

export class GetAllMaterialsQueryDto extends BaseQueryDto {
  @IsOptional()
  @IsEnum(MaterialType)
  type?: MaterialType;
}
