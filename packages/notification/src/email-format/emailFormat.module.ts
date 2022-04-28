import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '@seaccentral/core/dist/user/users.module';
import { EmailFormat } from '@seaccentral/core/dist/notification/EmailFormat.entity';
import { EmailNotification } from '@seaccentral/core/dist/notification/EmailNotification.entity';
import { UploadModule } from '../upload/upload.module';
import { EmailFormatController } from './emailFormat.controller';
import { EmailFormatService } from './emailFormat.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailFormat, EmailNotification]),
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
  controllers: [EmailFormatController],
  providers: [EmailFormatService],
})
export class EmailFormatModule {}
