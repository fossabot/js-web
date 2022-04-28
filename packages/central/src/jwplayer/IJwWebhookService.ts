export enum JWEvent {
  channelActive = 'channel_active',
  channelCreated = 'channel_created',
  channelIdle = 'channel_idle',
  conversionsComplete = 'conversions_complete',
  mediaAvailable = 'media_available',
  mediaDeleted = 'media_deleted',
  mediaReuploaded = 'media_reuploaded',
  mediaUpdated = 'media_updated',
}

export interface CreateWebhookPayload {
  metadata: {
    webhook_url: string;
    events: JWEvent[];
    name: string;
    description?: string;
    site_ids?: string[];
  };
}

export interface CreateWebhookResponse {
  id: string;
  created: string;
  last_modified: string;
  type: string;
  relationships: Record<string, string>;
  metadata: CreateWebhookPayload;
  secret: string;
}

export interface GetWebhookResponse {
  id: string;
  created: string;
  last_modified: string;
  type: string;
  relationships: Record<string, string>;
  metadata: CreateWebhookPayload;
}
