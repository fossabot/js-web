import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationProducer } from './notification.producer';
import { QueueMetadata } from './queueMetadata';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: Number(configService.get('REDIS_PORT')),
          password: configService.get('REDIS_AUTH_PASS'),
        },
        defaultJobOptions: {
          removeOnComplete: true,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          attempts: 3,
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: QueueMetadata.notification.queueName,
    }),
  ],
  providers: [NotificationProducer],
  exports: [BullModule, NotificationProducer],
})
export class QueueModule {}
