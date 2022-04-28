import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export const JWAPI = 'JWAPI';

function useAxios(configProvider: ConfigService) {
  const siteId = configProvider.get<string>('JWPLAYER_SITE_ID');
  const token = configProvider.get<string>('JWPLAYER_TOKEN');

  return axios.create({
    baseURL: `https://api.jwplayer.com/v2/sites/${siteId}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export const jwapiFactory = {
  provide: JWAPI,
  useFactory: useAxios,
  inject: [ConfigService],
};
