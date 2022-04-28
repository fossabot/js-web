import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { jwapiFactory } from './jwapi';
import { JWMediaService } from './jwmedia.service';
import { jwResourceApiFactory } from './jwResourceApi';
import { JwWebhookGuard } from './jwWebhook.guard';
import { JwWebhookService } from './jwWebhook.service';
import { JWCdnService } from './jwcdn.service';
import { JwPlaylistService } from './jwPlaylist.service';

@Module({
  imports: [ConfigModule],
  providers: [
    jwapiFactory,
    jwResourceApiFactory,
    JWMediaService,
    JwWebhookService,
    JwWebhookGuard,
    JWCdnService,
    JwPlaylistService,
  ],
  exports: [
    JWMediaService,
    JwWebhookService,
    JwWebhookGuard,
    JWCdnService,
    JwPlaylistService,
  ],
})
export class JWPlayerModule {}
