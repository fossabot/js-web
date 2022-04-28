import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosInstance } from 'axios';
import { defaultTo } from 'lodash';
import {
  CreateWebhookPayload,
  CreateWebhookResponse,
  GetWebhookResponse,
} from './IJwWebhookService';
import { JW_RESOURCE_API } from './jwResourceApi';

@Injectable()
export class JwWebhookService {
  constructor(
    @Inject(JW_RESOURCE_API) private readonly jwResourceApi: AxiosInstance,
    private readonly configService: ConfigService,
  ) {}

  // https://developer.jwplayer.com/jwplayer/reference/post_v2-webhooks
  async createWebhook(payload: CreateWebhookPayload) {
    const site_ids = defaultTo(payload.metadata.site_ids, [
      this.configService.get('JWPLAYER_SITE_ID'),
    ]);
    payload.metadata.site_ids = site_ids;
    const { data } = await this.jwResourceApi.post<CreateWebhookResponse>(
      'webhooks',
      payload,
    );

    return data;
  }

  // https://developer.jwplayer.com/jwplayer/reference/get_v2-webhooks-webhook-id-
  async getWebhook(webhookId: string) {
    const { data } = await this.jwResourceApi.get<GetWebhookResponse>(
      `webhooks/${webhookId}`,
    );

    return data;
  }
}
