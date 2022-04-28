/* eslint-disable max-classes-per-file */

import { Media } from '@seaccentral/core/dist/media/media.entity';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class MediaPartialDto extends Media {
  @IsUUID('4')
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  jwMediaId: string;
}

export class CreatePlaylistDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  // so that we don't have to initiate db query for all medias just to get jwMediaId
  @ValidateNested({ each: true })
  @IsNotEmpty({ each: true })
  medias: MediaPartialDto[];
}
