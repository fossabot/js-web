import API_PATHS from '../constants/apiPaths';
import { centralHttp } from '../http';
import { BaseResponseDto } from '../models/BaseResponse.dto';
import { Media, MediaStatus } from '../models/media';

interface JWPlayerOptions {
  onPlay?: () => any;
  onPause?: () => any;
  onComplete?: () => any;
  onReady?: () => any;
  onPlaylist?: () => any;
}

export function useJWPlayer(
  elementId: string,
  media: Media,
  options?: JWPlayerOptions,
) {
  // https://developer.jwplayer.com/jwplayer/docs/jw8-javascript-api-reference
  let instance: any;

  async function init(configOptions: Record<string, any> = {}) {
    if (media.status === MediaStatus.Created) {
      return false;
    }
    const { data } = await centralHttp.get<BaseResponseDto<string>>(
      API_PATHS.MEDIA_ID_SIGNED_URL.replace(':id', media.id),
    );

    instance = window.jwplayer(elementId);
    instance.setup({
      ...configOptions,
      aspectratio: '16:9',
      responsive: true,
      displaydescription: false,
      playlist: data.data,
    });
    instance.on('setupError', (err) => console.log(err));
    instance.on('ready', options?.onReady);
    instance.on('playlist', options?.onPlaylist);
    instance.on('play', options?.onPlay);
    instance.on('pause', options?.onPause);
    instance.on('complete', options?.onComplete);
  }

  return { init, id: elementId };
}
