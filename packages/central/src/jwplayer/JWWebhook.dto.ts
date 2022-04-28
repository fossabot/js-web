import { JWEvent } from './IJwWebhookService';

export class JWWebhookDto {
  event: JWEvent;

  media_id: string;

  webhook_id: string;

  site_id: string;

  event_time: string;
}
