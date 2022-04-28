import urljoin from 'url-join';
import { JwWebhookService } from '../jwplayer/jwWebhook.service';
import { JWEvent } from '../jwplayer/IJwWebhookService';

export async function createJwPlayerWebhook(
  jwWebhookService: JwWebhookService,
) {
  const host = process.env.HOST;
  if (!host) {
    throw new Error(
      'HOST env not found, Please enter a host using HOST env with a value eg. https://example.com',
    );
  }

  const res = await jwWebhookService.createWebhook({
    metadata: {
      webhook_url: urljoin(host, 'api/central/v1/media/hook/media-available'),
      events: [JWEvent.mediaAvailable],
      name: 'media available (system generated)',
    },
  });

  return res;
}
