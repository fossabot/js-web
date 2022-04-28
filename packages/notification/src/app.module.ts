import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { QueueModule } from '@seaccentral/core/dist/queue/queue.module';
import connectionConfig from '@seaccentral/core/dist/connection';

import { UsersModule } from '@seaccentral/core/dist/user/users.module';
import { AppController } from './app.controller';
import { EmailFormatModule } from './email-format/emailFormat.module';
import { EmailModule } from './email/email.module';
import { NotificationConsumer } from './notification.consumer';
import { PushModule } from './push/push.module';
import { PushService } from './push/push.service';
import { UploadModule } from './upload/upload.module';
import { UserModule } from './user/userNotification.module';
import { EmailNotificationModule } from './email-notification/emailNotification.module';
import { CronModule } from './cron/cron.module';
import { SystemAnnouncementModule } from './system-announcement/systemAnnouncement.module';

@Module({
  imports: [
    EmailModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      ...(connectionConfig as TypeOrmModuleAsyncOptions),
      autoLoadEntities: true,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get('JWT_EXPIRATION_TIME_IN_SECONDS')}s`,
        },
      }),
    }),
    PushModule,
    QueueModule,
    UploadModule,
    EmailFormatModule,
    EmailNotificationModule,
    UserModule,
    UsersModule,
    CronModule,
    SystemAnnouncementModule,
  ],
  controllers: [AppController],
  providers: [PushService, NotificationConsumer],
})
export class AppModule {}
