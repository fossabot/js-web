import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { JwtStrategy } from '@seaccentral/core/dist/auth/jwt.strategy';
import { connectionConfig } from '@seaccentral/core/dist/connection';
import { PushNotification } from '@seaccentral/core/dist/notification/PushNotification.entity';
import { UserNotification } from '@seaccentral/core/dist/notification/UserNotification.entity';
import { UsersModule } from '@seaccentral/core/dist/user/users.module';
import { PushNotificationController } from './notify.controller';
import { NotifyService } from './notify.service';
import { PushService } from './push.service';
import { NotificationReminderModule } from './reminders/reminder.module';

@Module({
  imports: [
    UsersModule,
    NotificationReminderModule,
    TypeOrmModule.forRoot({
      ...(connectionConfig as TypeOrmModuleAsyncOptions),
      autoLoadEntities: true,
    }),
    TypeOrmModule.forFeature([PushNotification, UserNotification]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
      }),
    }),
  ],
  providers: [PushService, JwtStrategy, NotifyService],
  exports: [PushService, NotifyService],
  controllers: [PushNotificationController],
})
export class PushModule {}
