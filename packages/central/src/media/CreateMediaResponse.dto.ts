import { Media } from '@seaccentral/core/dist/media/media.entity';
import { CreateMediaResponse } from '../jwplayer/IJWMediaService';

export class CreateMediaResponseDto {
  media: Media;

  jwMedia: CreateMediaResponse;
}
