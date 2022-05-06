import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationProducer } from './notification.producer';
import { EmailNotificationFilterService } from './emailNotificationFilter.service';
import { QueueMetadata } from './queueMetadata';
import { UserAuthProvider } from '../user/UserAuthProvider.entity';

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
    TypeOrmModule.forFeature([UserAuthProvider]),
  ],
  providers: [NotificationProducer, EmailNotificationFilterService],
  exports: [BullModule, NotificationProducer],
})
export class QueueModule {}
