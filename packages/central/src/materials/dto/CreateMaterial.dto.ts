import { MaterialType } from '@seaccentral/core/dist/material/material.entity';
import {
  IsEnum,
  IsHash,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  ValidateIf,
} from 'class-validator';
import mime from 'mime';

export class CreateMaterialDto {
  @IsEnum(MaterialType)
  type: MaterialType;

  @IsString()
  @IsNotEmpty()
  displayName: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  language?: string;

  @ValidateIf((object: CreateMaterialDto) => object.type === 'MaterialInternal')
  @IsIn([
    mime.getType('doc'),
    mime.getType('docx'),
    mime.getType('pdf'),
    mime.getType('ppt'),
    mime.getType('pptx'),
    mime.getType('xlsx'),
    mime.getType('xls'),
  ])
  mime?: string;

  @ValidateIf((object: CreateMaterialDto) => object.type === 'MaterialInternal')
  @IsString()
  @IsNotEmpty()
  filename?: string;

  @ValidateIf((object: CreateMaterialDto) => object.type === 'MaterialInternal')
  @IsPositive()
  bytes?: number;

  @ValidateIf((object: CreateMaterialDto) => object.type === 'MaterialInternal')
  @IsHash('sha256')
  hash?: string;

  @ValidateIf((object: CreateMaterialDto) => object.type === 'MaterialExternal')
  @IsUrl()
  url?: string;
}
