import { FC, useEffect, useState } from 'react';
import Script from 'next/script';
import { centralHttp } from '../http';
import { BaseResponseDto } from '../models/BaseResponse.dto';
import API_PATHS from '../constants/apiPaths';

export interface IJWPlayerScript {
  onLoad: () => any;
}

export const JWPlayerScript: FC<IJWPlayerScript> = (props) => {
  const { onLoad } = props;

  const [playerUrl, setPlayerUrl] = useState<string>();

  useEffect(() => {
    getPlayerUrl();
  }, []);

  async function getPlayerUrl() {
    const { data } = await centralHttp.get<BaseResponseDto<string>>(
      API_PATHS.MEDIA_PLAYER_URL,
    );
    const url = data.data;
    setPlayerUrl(url);
    return url;
  }

  function handleError() {
    console.error(
      `Video player script fails to load, possible root cause
    - If an endpoint returns 404, a video player id could be invalid
    - If an endpoint returns 403, a video player id is valid, but the link is already expired or got an invalid signature. Please check exp and sig parameter`,
    );
  }

  if (!playerUrl) {
    return null;
  }

  return <Script src={playerUrl} onLoad={onLoad} onError={handleError} />;
};
