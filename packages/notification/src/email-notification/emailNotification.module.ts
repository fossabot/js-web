import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '@seaccentral/core/dist/user/users.module';
import { EmailNotification } from '@seaccentral/core/dist/notification/EmailNotification.entity';
import { EmailNotificationSenderDomain } from '@seaccentral/core/dist/notification/EmailNotificationSenderDomain.entity';
import { Language } from '@seaccentral/core/dist/language/Language.entity';
import { UploadModule } from '../upload/upload.module';
import { EmailNotificationController } from './emailNotification.controller';
import { EmailNotificationService } from './emailNotification.service';
import { EmailNotificationSenderDomainController } from './emailNotificationSenderDomain.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EmailNotification,
      EmailNotificationSenderDomain,
      Language,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get('JWT_EXPIRATION_TIME_IN_SECONDS')}s`,
        },
      }),
    }),
    UsersModule,
    UploadModule,
  ],
  controllers: [
    EmailNotificationController,
    EmailNotificationSenderDomainController,
  ],
  providers: [EmailNotificationService],
})
export class EmailNotificationModule {}
