import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export const JW_RESOURCE_API = 'JW_RESOURCE_API';

function useAxios(configProvider: ConfigService) {
  const token = configProvider.get<string>('JWPLAYER_TOKEN');

  return axios.create({
    baseURL: 'https://api.jwplayer.com/v2',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export const jwResourceApiFactory = {
  provide: JW_RESOURCE_API,
  useFactory: useAxios,
  inject: [ConfigService],
};
