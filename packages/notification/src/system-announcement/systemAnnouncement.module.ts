import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemAnnouncement } from '@seaccentral/core/dist/notification/SystemAnnouncement.entity';
import { UsersModule } from '@seaccentral/core/dist/user/users.module';
import { UploadModule } from '../upload/upload.module';
import { SystemAnnouncementController } from './systemAnnouncement.controller';
import { SystemAnnouncementService } from './systemAnnouncement.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SystemAnnouncement]),
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
    UploadModule,
    UsersModule,
  ],
  providers: [SystemAnnouncementService],
  controllers: [SystemAnnouncementController],
})
export class SystemAnnouncementModule {}
